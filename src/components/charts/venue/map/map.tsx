import * as React from "react";
import * as d3 from 'd3';
import { Slider, Select, Button, Row, Col, message, Divider } from 'antd';
import Floor from './floor'
import WatchList from './watch_list'
import { dataVenues, dataWalls, IWalls, IDataVenues } from '../../../../data/venue';
import { v2, AreaFloor, IDataDayIDTimeSID, MODE_VENUE_POPULATION, MODE_POPULATION, MarkedPosition, PositionFloor, TimeSpan } from '../../../../types/interfaces';
import { dataTimesIntervalClamp, numFramesIntervalClamp } from '../../../../data/data_time';
// import { dataOD, limitODValue } from '../../../../data/ODAll';
import { maxNumBlockTimePopDays } from '../../../../data/data_misc'
import { getSidOfIDAtTime, sid2Pos, querySpatialTemporal, querySpatialTemporalOnce, frameWithInterval2frameSec, frame2Time, number2StrFill0 } from '../../../../utils'

interface Props {
    sizeSVG: v2
    sizeBlock: number         // 单元格尺寸, 像素
    day: number
    modePopulation: MODE_POPULATION
}
interface State {
    curTime: number;   // 距当天开始(7:00)经过秒数

    modeVenuePopLine: MODE_VENUE_POPULATION;
    modeVenuePopRect: MODE_VENUE_POPULATION;

    curTimeSelection: TimeSpan;
    rectSelectContID: number;
    curRectSelection: AreaFloor | null;
    signRectSelectionChanged: boolean;

    watchListChanged: boolean;
    dataIDTime: IDataDayIDTimeSID | null;
}
export default class MapVenue extends React.Component<Props, State> {

    SVGref: SVGSVGElement | null = null
    gap: number = 1                                            // 两楼层间间隔单元格数量
    sizeFloors: v2[] = [{ a: 30, b: 16 }, { a: 13, b: 16 }]
    offsetFloor2: number = (30 + this.gap) * this.props.sizeBlock     // 一楼横向单元格数量+gap
    heightFloor: number = this.props.sizeBlock * 16                  // 2个楼层的高度是相同的
    dataTimes: string[] = dataTimesIntervalClamp[300]
    numFrames: number = numFramesIntervalClamp[300]
    splitDataVenues: IDataVenues[] = this.splitDataVenueByFloor(dataVenues)
    splitDataWalls: IWalls[][] = this.splitDataWallByFloor(dataWalls)
    watchList: Map<string, boolean> = new Map();

    listMaxValHeat: number[] = []
    maxValHeat: number = 0
    scaleColorHeat: d3.ScaleSequential<string> = d3.scaleSequential(d3.interpolateOrRd);


    constructor(props: Props) {
        super(props);

        this.state = {
            curTime: 0,
            modeVenuePopLine: MODE_VENUE_POPULATION.RATIO,
            modeVenuePopRect: MODE_VENUE_POPULATION.VENUE,

            curTimeSelection: { st: 0, ed: 0 },
            curRectSelection: null,
            rectSelectContID: 0,
            signRectSelectionChanged: false,

            watchListChanged: false,
            dataIDTime: null,
        }

        this.loadData()

        this.handleTimeChange = this.handleTimeChange.bind(this)
        // this.handleTimeAfterChange = this.handleTimeAfterChange.bind(this)
        this.handleModeVenueLine = this.handleModeVenueLine.bind(this)
        this.handleModeVenueRect = this.handleModeVenueRect.bind(this)
        this.handleRectSelectChange = this.handleRectSelectChange.bind(this)
        this.handleRectSelectStart = this.handleRectSelectStart.bind(this)

        // for 时空查询
        this.handleTimeSpanChange = this.handleTimeSpanChange.bind(this)
        this.querySpatialTemporal = this.querySpatialTemporal.bind(this)

        // for watch list 
        this.handleWatchListAdd = this.handleWatchListAdd.bind(this)
        this.handleWatchListRemove = this.handleWatchListRemove.bind(this)

        this.handleWatchListMarkChange = this.handleWatchListMarkChange.bind(this)
    }
    loadData() {
        const { day } = this.props
        fetch(`./data/id_time/data${day + 1}.json`)
            .then(res => res.json())
            .then(data => {
                this.setState({ dataIDTime: data })
            })
    }
    componentDidUpdate(preProps: Props) {
        if (this.props.day !== preProps.day) {
            this.loadData()
        }
    }
    splitDataVenueByFloor(dataVenues: IDataVenues): IDataVenues[] {
        const ret: IDataVenues[] = []
        for (const vid in dataVenues) {
            const venue = dataVenues[vid]

            const idx = venue.floor - 1;
            if (typeof ret[idx] === 'undefined') {
                ret[idx] = { [vid]: venue };
            } else {
                ret[idx][vid] = venue;
            }
        }

        return ret
    }
    splitDataWallByFloor(dataWalls: IWalls[]): IWalls[][] {
        const ret: IWalls[][] = [];
        for (const wall of dataWalls) {
            const idx = wall.floor - 1
            if (typeof ret[idx] === 'undefined') {
                ret[idx] = [wall];
            } else {
                ret[idx].push(wall);
            }
        }

        return ret;
    }
    // 注意时间的取值范围/采样间隔/元素数量
    handleTimeChange(value: any): void {
        this.setState({ curTime: value });
    }
    // handleTimeAfterChange(value: any): void {
    //     this.setState({ curTime: value });
    // }
    handleModeVenueLine(value: any): void {
        this.setState({ modeVenuePopLine: value })
    }
    handleModeVenueRect(value: any): void {
        this.setState({ modeVenuePopRect: value })
    }
    // 当前正在选择的rect select
    handleRectSelectStart(floor: number) {
        if (floor === 0) {
            // clear selection floor 1
            this.setState({ rectSelectContID: 0 })
        } else if (floor === 1) {
            // clear selection floor 0
            this.setState({ rectSelectContID: 1 })
        }
    }
    handleRectSelectChange(area: AreaFloor | null): void {
        // console.log('handleRectSelectChange', area);
        this.setState({
            curRectSelection: area,
            signRectSelectionChanged: !this.state.signRectSelectionChanged
        })
    }
    handleTimeSpanChange(val: any) {
        let st = frameWithInterval2frameSec(val[0], 300),
            ed = frameWithInterval2frameSec(val[1], 300)
        this.setState({ curTimeSelection: { st: st, ed: ed } })
    }
    handleWatchListAdd(val: string) {
        if (!(val in this.watchList)) {
            this.watchList.set(val, false)
        }
        this.setState({
            watchListChanged: !this.state.watchListChanged
        })
    }
    handleWatchListRemove(val: string) {
        this.watchList.delete(val)
        this.setState({
            watchListChanged: !this.state.watchListChanged
        })
    }
    handleWatchListMarkChange(val: string, checked: boolean) {
        if (this.watchList.has(val)) {
            this.watchList.set(val, checked)
            this.setState({ watchListChanged: !this.state.watchListChanged })
        } else {
            console.warn('ID to mark not existed in the watch list: ' + val)
        }
    }
    querySpatialTemporal() {
        const { curTimeSelection, curRectSelection } = this.state
        console.log('querySpatialTemporal', curTimeSelection, curRectSelection)
        if (curRectSelection === null || this.state.dataIDTime === null) {
            message.warning(`查询无效, 没有空间选择或数据未加载`);
            return new Set([])
        }
        let targets: Set<string> = querySpatialTemporalOnce(this.state.dataIDTime)(curTimeSelection, curRectSelection);
        // let targets: Set<string> = querySpatialTemporal(this.state.dataIDTime)(curTimeSelection, curRectSelection);
        message.success(`查询完成, 得到${targets.size}条记录(人员)`);

        this.watchList = new Map()
        targets.forEach(name => {
            this.watchList.set(name, false)
        })
        this.setState({ watchListChanged: !this.state.watchListChanged })
    }
    getPositionsOfWatchList(): [MarkedPosition[], MarkedPosition[]] {
        // 找到当前 watchList 中人员的坐标点, 传给子 floor
        const { curTime, dataIDTime } = this.state
        let time: number = frameWithInterval2frameSec(curTime, 300)

        let positions: [MarkedPosition[], MarkedPosition[]] = [[], []]  // floor
        if (dataIDTime !== null) {
            const funcGetSid: (ID: string, time: number) => string | null = getSidOfIDAtTime(dataIDTime)
            this.watchList.forEach((marked, ID) => {
                const sid = funcGetSid(ID, time)
                if (sid !== null) {
                    const pos: PositionFloor = sid2Pos(sid)
                    positions[pos.floor - 1].push({
                        x: pos.x,
                        y: pos.y,
                        ID: ID,  // 暂时加上,需要判别类型
                        marked: marked
                    })
                }
            })
        }
        return positions
    }
    render() {
        const { day, sizeBlock } = this.props
        const { curTime, curRectSelection, curTimeSelection } = this.state

        const positionsWatched = this.getPositionsOfWatchList()

        let posX: string = '', posY: string = '', posWidth: string = '', posHeight: string = '', posFloor = ''

        if (curRectSelection !== null) {
            posFloor = (curRectSelection.floor + 1).toString()
            posX = curRectSelection.x.toString()
            posY = curRectSelection.y.toString()
            posWidth = curRectSelection.width.toString()
            posHeight = curRectSelection.height.toString()
        }
        let temporalSt: string = '', temporalEd: string = ''
        if (curTimeSelection !== null) {
            // console.log(curTimeSelection)
            let tmp = frame2Time(curTimeSelection.st)
            temporalSt = number2StrFill0(tmp[0]) + ':' + number2StrFill0(tmp[1])
            tmp = frame2Time(curTimeSelection.ed)
            temporalEd = number2StrFill0(tmp[0]) + ':' + number2StrFill0(tmp[1])
        }

        // color bar
        this.listMaxValHeat = (this.props.modePopulation === MODE_POPULATION.STATIC) ?
            maxNumBlockTimePopDays.static : maxNumBlockTimePopDays.dynamic
        this.maxValHeat = this.listMaxValHeat[this.props.day]   // default max value for heat
        this.scaleColorHeat.domain([0, this.maxValHeat]);

        return (
            <div className="material-card" id="map" style={{ width: this.props.sizeSVG.a, marginBottom: 40 }}>
                <div id="control-map" >
                    <div id="control-map-venue" className="control-panel material-card">
                        <div style={{ marginBottom: '24px' }}>
                            场馆流量折线图最大值:
                            <Select defaultValue={this.state.modeVenuePopLine} style={{ width: 200 }}
                                onChange={this.handleModeVenueLine}>
                                <Select.Option value={MODE_VENUE_POPULATION.RATIO}>各场馆最大值</Select.Option>
                                <Select.Option value={MODE_VENUE_POPULATION.VENUE}>所有场馆最大值</Select.Option>
                                <Select.Option value={MODE_VENUE_POPULATION.TOTAL}>当天总参会人数</Select.Option>
                            </Select>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <Row>
                                场馆当前流量指示最大值:
                                <Select defaultValue={this.state.modeVenuePopRect} style={{ width: 200 }}
                                    onChange={this.handleModeVenueRect}>
                                    <Select.Option value={MODE_VENUE_POPULATION.RATIO}>各场馆最大值</Select.Option>
                                    <Select.Option value={MODE_VENUE_POPULATION.VENUE}>所有场馆最大值</Select.Option>
                                    <Select.Option value={MODE_VENUE_POPULATION.TOTAL}>当天总参会人数</Select.Option>
                                </Select>
                            </Row>
                        </div>
                    </div>

                    <div id="control-map-people" className="control-panel control-panel-right material-card">
                        <div style={{ marginBottom: '24px' }}>
                            {/* 显示当前选择 */}
                            <Row>
                                <Col span={24}>
                                    <span> 楼层: {posFloor}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <span> 横坐标: {posX}</span>
                                </Col>
                                <Col span={12}>
                                    <span> 纵坐标: {posY}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <span> 横跨度: {posWidth}</span>
                                </Col>
                                <Col span={12}>
                                    <span> 纵跨度: {posHeight}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <span> 起始时间: {temporalSt}</span>
                                </Col>
                                <Col span={12}>
                                    <span>  结束时间: {temporalEd}</span>
                                </Col>
                            </Row>
                            <Button onClick={this.querySpatialTemporal}>执行查询 </Button>
                        </div>
                        <Divider />

                        <WatchList
                            list={this.watchList}
                            onAdd={this.handleWatchListAdd}
                            onRemove={this.handleWatchListRemove}
                            onMark={this.handleWatchListMarkChange}
                        />
                    </div>
                </div>

                <Row type="flex" justify="center">
                    <Col>
                        {/* <div className="color-bar"
                    style={{background:linear-gradient(to right,  #ff0000 0%,#ffff00 25%,#007f08 50%,turquoise 75%,blue 100%)   }}></div> */}
                        <div id="color-bar-container">
                            <span className="color-bar-label-left">0</span>
                            <div id="color-bar"
                                style={{ background: `linear-gradient(to right, ${this.scaleColorHeat(0)} 0%, ${this.scaleColorHeat(.25 * this.maxValHeat)} 25%, ${this.scaleColorHeat(.5 * this.maxValHeat)} 50%,${this.scaleColorHeat(.75 * this.maxValHeat)} 75%, ${this.scaleColorHeat(this.maxValHeat)} 100%)` }}>
                            </div>
                            <span className="color-bar-label-right">{this.maxValHeat}</span>
                        </div>

                        <svg
                            width={this.props.sizeSVG.a}
                            height={this.props.sizeSVG.b}
                            ref={(ref: SVGSVGElement) => this.SVGref = ref}
                        >
                            <g>
                                <Floor
                                    floor={0}
                                    size={this.sizeFloors[0]}
                                    sizeBlock={sizeBlock}
                                    venues={this.splitDataVenues[0]}
                                    day={day}
                                    time={curTime}

                                    modeVenuePopLine={this.state.modeVenuePopLine}
                                    modeVenuePopRect={this.state.modeVenuePopRect}
                                    modePopulation={this.props.modePopulation}

                                    onRectSelectChange={this.handleRectSelectChange}
                                    rectSelectContID={this.state.rectSelectContID}
                                    onRectSelectStart={this.handleRectSelectStart}
                                    curRectSelection={this.state.curRectSelection}
                                    signRectSelectionChanged={this.state.signRectSelectionChanged}

                                    targetPositions={positionsWatched[0]}
                                    maxValHeat={this.maxValHeat}
                                />
                            </g>
                            <g style={{ transform: `translate(${this.offsetFloor2}px, ${0}px)` }}>
                                <Floor
                                    floor={1}
                                    size={this.sizeFloors[1]}
                                    sizeBlock={sizeBlock}
                                    venues={this.splitDataVenues[1]}
                                    day={day}
                                    time={curTime}

                                    modeVenuePopLine={this.state.modeVenuePopLine}
                                    modeVenuePopRect={this.state.modeVenuePopRect}
                                    modePopulation={this.props.modePopulation}

                                    onRectSelectChange={this.handleRectSelectChange}
                                    rectSelectContID={this.state.rectSelectContID}
                                    onRectSelectStart={this.handleRectSelectStart}
                                    curRectSelection={this.state.curRectSelection}
                                    signRectSelectionChanged={this.state.signRectSelectionChanged}

                                    targetPositions={positionsWatched[1]}
                                    maxValHeat={this.maxValHeat}
                                />
                            </g>
                            {/* <VenuesODGraph
                                venues={dataVenues}
                                sizeBlock={sizeBlock}
                                day={day}
                                floor1Offset={this.offsetFloor2}
                            /> */}
                        </svg>
                    </Col>
                </Row>

                <div id="map-sliders">
                    <Row type="flex" justify="center" align="middle">
                        <Col span={2}>
                            <Row type="flex" justify="center">
                                <span>07:00</span>
                            </Row>
                        </Col>
                        <Col span={20}>
                            <Slider
                                defaultValue={0}
                                onChange={this.handleTimeChange}
                                // onAfterChange={this.handleTimeAfterChange}
                                min={0}
                                max={this.numFrames - 1}
                                tooltipVisible={true}
                                tipFormatter={(val: number) => this.dataTimes[val]}
                            />
                            <Slider
                                defaultValue={[0, 0]}
                                range
                                onAfterChange={this.handleTimeSpanChange}
                                min={0}
                                max={this.numFrames - 1}
                                tipFormatter={(val: number) => this.dataTimes[val]}
                            />
                        </Col>
                        <Col span={2}>
                            <Row type="flex" justify="center">
                                <span >20:00</span>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </div >
        )
    }
}
//
// interface PropsVenuesODGraph {
//     venues: IDataVenues;
//     sizeBlock: number;
//     day: number;
//     floor1Offset: number;
// }
// export class VenuesODGraph extends React.Component<PropsVenuesODGraph, {}>{
//     ref: any = null;
//     positions: { [key: string]: v2 } = {};

//     constructor(props: PropsVenuesODGraph) {
//         super(props)
//         this.setVenuePositions()
//     }
//     setVenuePositions() {
//         // 计算渲染尺寸和渲染位置, 并暂时保存
//         const { sizeBlock, venues, floor1Offset } = this.props

//         for (const vid in venues) {
//             const venue = venues[vid]
//             this.positions[vid] = {
//                 a: (venue.x + venue.width / 2) * sizeBlock + (venue.floor - 1) * floor1Offset,
//                 b: (venue.y + venue.height / 2) * sizeBlock
//             }
//         }
//     }
//     render() {
//         const lines = []
//         const data = dataOD[this.props.day]
//         const limits = limitODValue[this.props.day]
//         const scaleColor = d3.scaleSequential(d3.interpolateOranges)
//             .domain([0, limits[1]])

//         for (const key in data) {
//             const [oriVID, tarVID] = key.split('.')
//             const val = data[key]
//             const color = scaleColor(val)
//             const oriPos = this.positions[oriVID],
//                 tarPos = this.positions[tarVID];
//             lines.push((
//                 <line
//                     x1={oriPos.a}
//                     y1={oriPos.b}
//                     x2={tarPos.a}
//                     y2={tarPos.b}
//                     stroke={color}
//                 />
//             ))
//         }

//         return (
//             <g className="OD-graph" ref={(ref: SVGSVGElement) => { this.ref = ref }}>
//                 {lines}
//             </g>
//         )
//     }
// }
