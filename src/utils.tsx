import { IDataDayIDTimeSID, PositionFloor, TimeSpan, AreaFloor } from './types/interfaces'

export function number2StrFill0(num: number) {
    return num < 10 ? `0${num.toString()}` : num.toString()
}

// 受到间隔采样和掐头去尾的帧序号 => 完整时间序号
export function frameWithInterval2frameSec(frame: number, timeInterval: 1 | 60 | 300): number {
    return 25200 + frame * timeInterval;
}

// 完整时间序号 => [hour min]
export function frame2Time(frame: number): [number, number] {
    let hour = Math.floor(frame / 3600),
        min = frame % 3600 / 60
    return [hour, min];
}

export function frameWithInterval2Time(frame: number, timeInterval: 1 | 60 | 300): [number, number] {
    return frame2Time(frameWithInterval2frameSec(frame, timeInterval))
}

export function sid2Pos(sid: string): PositionFloor {
    return {
        floor: parseInt(sid.charAt(0)),
        y: parseInt(sid.slice(1, 3)),
        x: parseInt(sid.slice(3, 5))
    }
}

export function pos2Sid(floor: number, x: number, y: number) {
    let y_str: string = y < 10 ? `0${y}` : y.toString(),
        x_str: string = x < 10 ? `0${x}` : x.toString()
    return `${floor}${y_str}${x_str}`
}

// null: 未知
export function getSidOfIDAtTime(data: IDataDayIDTimeSID): (ID: string, time: number) => string | null {
    return function (ID: string, time: number): string | null {
        if (!(ID in data)) { return null }
        const traj = data[ID]
        let [sid0, t0] = traj[0]
        if (t0 > time) return null
        else if (t0 === time) return sid0

        let sid: string, t: number
        for (let i = 1; i < traj.length; i++) {
            [sid, t] = traj[i]
            if (t > time) {
                return sid0
            } else if (t === time) {
                return sid
            }
            sid0 = sid
            t0 = t
        }
        // 停留在最后地点:sid0 还是 判无:null?
        // return sid0
        return null
    }
}

// 目前不用跨天查询, 读取哪天的文件是由 Map 根据 props.day 决定的 
// 需要目标在指定的时间段内一直处于一个地点范围,
export function querySpatialTemporal(data: IDataDayIDTimeSID): (temporal: TimeSpan, spatial: AreaFloor) => Set<string> {
    return function (temporal: TimeSpan, spatial: AreaFloor): Set<string> {
        const ret: Set<string> = new Set([]);
        for (const ID in data) {
            const traj: [string, number][] = data[ID]
            if (traj[0][1] <= temporal.st && traj[traj.length - 1][1] >= temporal.ed) {
                let t1 = temporal.st, t2 = temporal.ed
                let p = true
                // 找到最大的不大于等于起止时间的时间点
                for (let pt of traj) {
                    let time = pt[1];
                    if (time <= temporal.st) {
                        t1 = time
                        t2 = time
                    }
                    else if (time <= temporal.ed) {
                        t2 = time
                    }
                    else { break }
                }

                for (let pt of traj) {
                    let [sid, time] = pt
                    if (time >= t1) {
                        if (time > t2) { break }
                        // check if in area
                        let pos = sid2Pos(sid)
                        if (pos.floor === spatial.floor + 1) {
                            if (pos.x < spatial.x || pos.x >= spatial.x + spatial.width ||
                                pos.y < spatial.y || pos.y >= spatial.y + spatial.height) {
                                p = false
                                break
                            }
                        } else {
                            p = false
                            break
                        }
                    }
                }
                if (p) { ret.add(ID) }
            }
        }
        return ret
    }
}

// 只要出现一次就算
export function querySpatialTemporalOnce(data: IDataDayIDTimeSID): (temporal: TimeSpan, spatial: AreaFloor) => Set<string> {
    return function (temporal: TimeSpan, spatial: AreaFloor): Set<string> {
        const ret: Set<string> = new Set([]);
        for (const ID in data) {
            const traj: [string, number][] = data[ID]
            let t1 = temporal.st,
                t2 = temporal.ed

            for (let pt of traj) {
                let time = pt[1]
                if (time <= temporal.st)
                    t1 = time
                if (time <= temporal.ed)
                    t2 = time
            }
            for (let pt of traj) {
                let [sid, time] = pt
                if (time >= t1) {
                    if (time > t2) { break }
                    let pos = sid2Pos(sid)
                    if (pos.floor === spatial.floor + 1 &&
                        pos.x >= spatial.x && pos.x < spatial.x + spatial.width &&
                        pos.y >= spatial.y && pos.y < spatial.y + spatial.height) {
                        ret.add(ID)
                        break
                    }
                }
            }
        }
        return ret;
    }
}
