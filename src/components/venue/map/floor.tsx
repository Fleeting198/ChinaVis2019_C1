import * as React from "react";
import * as d3 from 'd3';
import Venues from './venues';
import RectSelect from './rect_select'
import { v2, AreaFloor, Area, MODE_VENUE_POPULATION, MODE_POPULATION, MarkedPosition } from '../../../types/interfaces';
import { styleMap, chNum } from '../../../data/data_misc'
import { sid2Pos, pos2Sid } from '../../../utils'
import { dataSidAll } from '../../../data/sid_all'
import { DataPopulationEntitiesDay } from '../../../types/interfaces';

// 负责单层场地地图的渲染
interface PropsFloor {
    floor: number
    size: v2
    sizeBlock: number
    day: number
    time: number

    modeVenuePopLine: MODE_VENUE_POPULATION
    modeVenuePopRect: MODE_VENUE_POPULATION
    modePopulation: MODE_POPULATION
    dataPopulationBlocks: DataPopulationEntitiesDay | null
    dataPopulationVenues: DataPopulationEntitiesDay | null

    onRectSelectChange: (a: AreaFloor | null) => void
    onRectSelectStart: (a: number) => void
    rectSelectContID: number
    curRectSelection: AreaFloor | null
    signRectSelectionChanged: boolean

    targetPositions: MarkedPosition[]
    maxValHeat: number,
    scaleColor: any
}
export default class Floor extends React.Component<PropsFloor, {}>{
    refGBlocks: SVGGElement | null = null;
    sidRects: { [key: string]: any } = {};

    constructor(props: PropsFloor) {
        super(props)

        // set scale color
        this.state = {
            data: null,
        }
        // if (this.props.modePopulation === MODE_POPULATION.STATIC) {
        //     this.scaleColor.domain([0, 0.6 * this.props.maxValHeat])
        // } else {
        //     this.scaleColor.domain([0, this.props.maxValHeat])
        // }

        this.handleRectSelectChange = this.handleRectSelectChange.bind(this)
        this.handleRectSelectStart = this.handleRectSelectStart.bind(this)
    }
    componentDidMount() {
        const { sizeBlock, floor } = this.props
        const ctx = d3.select(this.refGBlocks)

        for (const sid of dataSidAll[floor]) {
            const pos = sid2Pos(sid);
            const x = pos.x * sizeBlock,
                y = pos.y * sizeBlock;

            const rect = ctx.append('rect')
                .attr('key', sid)
                .attr('y', y)
                .attr('x', x)
                .attr('width', sizeBlock)
                .attr('height', sizeBlock)
                .attr('fill', 'none')
                .attr('stroke', styleMap.gridStroke)
            this.sidRects[sid] = rect;
        }
    }
    componentDidUpdate(prevProps: PropsFloor) {
        // time 更新, 改变block颜色
        let colorForUpdate: { [key: string]: string } = {}

        // 数据映射到颜色
        if (this.props.dataPopulationBlocks) {
            const data = this.props.dataPopulationBlocks;
            for (const sid in data) {
                let color = this.props.scaleColor(data[sid][this.props.time]);
                // const rect = this.sidRects[sid];
                colorForUpdate[sid] = color
            }
            // 框选的暗色效果, 通过直接修改 block 的颜色实现, 而不是添加额外的覆盖层
            // 显然, 若没有数据, 框选也是无意义的
            if (this.props.curRectSelection !== null &&
                this.props.curRectSelection.floor === this.props.floor
            ) {
                const { curRectSelection } = this.props

                const x2 = curRectSelection.x + curRectSelection.width,
                    y2 = curRectSelection.y + curRectSelection.height
                for (let x = curRectSelection.x; x < x2; x++) {
                    for (let y = curRectSelection.y; y < y2; y++) {
                        const sid = pos2Sid(curRectSelection.floor + 1, x, y)
                        if (sid in this.sidRects) {
                            // const rect = this.sidRects[sid]
                            const color: any = d3.color(colorForUpdate[sid])
                            colorForUpdate[sid] = color.darker(0.5).toString()
                            // .attr('stroke-width', styleMap.blockSelectedStrokeWidth)
                        }
                    }
                }
            }
            // 应用颜色渐变
            for (const sid in colorForUpdate) {
                if (sid in this.sidRects) {
                    this.sidRects[sid]
                        .transition()
                        .duration(100)
                        .attr('fill', colorForUpdate[sid])
                }
            }
        }
    }
    handleRectSelectStart() {
        this.props.onRectSelectStart(this.props.floor)
    }
    handleRectSelectChange(area: Area | null) {
        const ret: AreaFloor | null = area !== null ? {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
            floor: this.props.floor
        } : null;
        this.props.onRectSelectChange(ret)
    }
    render() {
        const { size, sizeBlock, targetPositions, dataPopulationVenues } = this.props;
        const positions = targetPositions.map((pos, idx) => {
            const x = (pos.x + 0.5) * sizeBlock, y = (pos.y + 0.5) * sizeBlock
            const { ID, marked } = pos
            // TODO:由ID的类别信息决定颜色
            let color = styleMap.individFill
            let info = marked ? (<text fontSize='12px' x={x} y={y}>{ID}</text>) : ''
            return (
                <g key={ID}>
                    <circle
                        cx={x}
                        cy={y}
                        r={styleMap.individRad}
                        fill={color}
                        stroke="none"
                    />
                    {info}
                </g>
            )
        })
        return (
            <g className="floor">
                {/* wall */}
                <rect
                    width={sizeBlock * size.a}
                    height={sizeBlock * size.b}
                    fill={styleMap.wallFill}
                ></rect>
                <g className="blocks"
                    ref={(ref: SVGGElement) => this.refGBlocks = ref}>
                </g>
                <Venues
                    sizeBlock={sizeBlock}
                    // venues={this.props.venues}
                    day={this.props.day}
                    time={this.props.time}
                    modeVenuePopLine={this.props.modeVenuePopLine}
                    modeVenuePopRect={this.props.modeVenuePopRect}
                    modePopulation={this.props.modePopulation}
                    dataPopulation={dataPopulationVenues}
                />
                <text y={20} x={5} style={{ fontWeight: "bold" }}>
                    {chNum[this.props.floor]}楼
            </text>
                <RectSelect
                    size={size}
                    sizeBlock={sizeBlock}
                    onChange={this.handleRectSelectChange}
                    onStart={this.handleRectSelectStart}
                    ID={this.props.floor}
                    controlID={this.props.rectSelectContID}
                />
                <g className="people-positions">
                    {positions}
                </g>
            </g >
        );
    }
}

// 
// interface PropsWalls {
//     sizeBlock: number;
//     walls: IWalls[];
// }
// class Walls extends React.Component<PropsWalls, {}>{
//     render() {
//         const { sizeBlock, walls } = this.props;

//         const ret: any[] = [];
//         walls.forEach((wall, idx) => {
//             let x = wall.x * sizeBlock,
//                 y = wall.y * sizeBlock,
//                 h = wall.height * sizeBlock,
//                 w = wall.width * sizeBlock

//             ret.push((
//                 <rect
//                     key={idx}
//                     x={x}
//                     y={y}
//                     width={w}
//                     height={h}
//                     fill={styleMap.wallFill}
//                     stroke={styleMap.wallStroke}
//                 />
//             ))
//         })

//         return (
//             <g className="walls">{ret}</g>
//         );
//     }
// }
//
// interface PropsGridLines {
//     size: v2;
//     sizeBlock: number;
// }
// class GridLines extends React.Component<PropsGridLines, {}>{
//     render() {
//         const { size, sizeBlock } = this.props;
//         const widthPixel = sizeBlock * size.a,
//             heightPixel = sizeBlock * size.b

//         let ret = []
//         for (let i = 0; i <= size.a; i++) { // width
//             let x = i * sizeBlock
//             let pos1 = [x, 0],
//                 pos2 = [x, heightPixel];
//             ret.push((
//                 <line
//                     key={'ver' + pos1[0]}
//                     x1={pos1[0]}
//                     y1={pos1[1]}
//                     x2={pos2[0]}
//                     y2={pos2[1]}
//                     stroke={styleMap.gridStroke}
//                 />
//             ))
//         }

//         for (let i = 0; i <= size.b; i++) {
//             let y = i * sizeBlock
//             let pos1 = [0, y],
//                 pos2 = [widthPixel, y];
//             ret.push((
//                 <line
//                     key={'hor' + pos1[1]}
//                     x1={pos1[0]}
//                     y1={pos1[1]}
//                     x2={pos2[0]}
//                     y2={pos2[1]}
//                     stroke={styleMap.gridStroke}
//                 />
//             ))
//         }
//         return (
//             <g className="grid-line">{ret}</g>
//         );
//     }
// }
