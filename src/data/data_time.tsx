
/**
 * 生成时间字符串数组
 *
 * @param {number} timeInterval : 相邻时间标签的间隔时间(sec)
 * @returns {string[]}
 */
function genDataTimes(timeInterval: number): string[] {
    let ret: string[] = [];
    let date_ = new Date(0);
    for (let i = 0; i < 86400; i += timeInterval) {
        date_.setTime(i * 1000);
        ret.push(date_.toUTCString().toString().slice(-12, -4));
    }

    return ret;
}

export const dataTimesInterval300: string[] = genDataTimes(300);    // 5 分钟粒度采样
export const dataTimesInterval60: string[] = genDataTimes(60);
export const dataTimesInterval1: string[] = genDataTimes(1);
export const dataTimesInterval: { [key: string]: string[] } = {
    1: dataTimesInterval1,
    60:dataTimesInterval60,
    300: dataTimesInterval300
}
export const numFramesInterval: { [key: string]: number } = {
    1: 86400,
    60: 1440,
    300: 288,
}

// clamped
export const clampIdx={
    1:[25200,14400],
    60:[420,240],
    300:[84,48]
}
export const dataTimesInterval1Clamp: string[] = dataTimesInterval1.slice(clampIdx[1][0], 72001)
export const dataTimesInterval60Clamp: string[] = dataTimesInterval1.slice(clampIdx[60][0], 1201) 
export const dataTimesInterval300Clamp: string[] = dataTimesInterval300.slice(clampIdx[300][0], 241)
export const dataTimesIntervalClamp: { [key: string]: string[] } = {
    1: dataTimesInterval1Clamp,
    60:dataTimesInterval60Clamp,
    300: dataTimesInterval300Clamp
}
export const numFramesIntervalClamp: { [key: string]: number } = {
    1: 46800,
    60: 780,
    300: 156,
}