import * as React from "react";
import * as d3 from 'd3';
import {  IVenue,dataVenues } from '../../../data/venue';
import { v2, MODE_VENUE_POPULATION, MODE_POPULATION,DataPopulationEntitiesDay } from '../../../types/interfaces';
import { maxNumVenueTimePop, styleMap } from '../../../data/data_misc';

// Venues, Venue, VenuePopulationRect, VenuePopulationLine

interface PropsVenues {
    sizeBlock: number
    day: number
    time: number
    modeVenuePopLine: MODE_VENUE_POPULATION    // 最大值类型
    modeVenuePopRect: MODE_VENUE_POPULATION
    modePopulation: MODE_POPULATION
    dataPopulation:DataPopulationEntitiesDay|null
}
export default class Venues extends React.Component<PropsVenues, {}>{
    positions: { [key: string]: v2 } = {}
    sizes: { [key: string]: v2 } = {}
    
    render() {
        const { sizeBlock, day, time,dataPopulation } = this.props;
        // const { dataTimePop } = this.state

        // 计算渲染尺寸和渲染位置, 并暂时保存        
        for (const vid in dataVenues) {
            const venue = dataVenues[vid]
            if (!(vid in this.positions)) {
                this.positions[vid] = { a: venue.x * sizeBlock, b: venue.y * sizeBlock }
            }
            if (!(vid in this.sizes)) {
                this.sizes[vid] = { a: venue.width * sizeBlock, b: venue.height * sizeBlock }
            }
        }

        const ret: any[] = [];
        for (const vid in dataVenues) {
            const venue = dataVenues[vid]
            // const data = dataTimePop ? dataTimePop[vid] : null;
            const dataVenue = dataPopulation ? dataPopulation[vid] : null;

            ret.push((
                <Venue
                    key={vid}
                    vid={vid}
                    renderPos={this.positions[vid]}
                    renderSize={this.sizes[vid]}
                    venue={venue}
                    day={day}
                    time={time}
                    modePopulation={this.props.modePopulation}
                    modeVenuePopLine={this.props.modeVenuePopLine}
                    modeVenuePopRect={this.props.modeVenuePopRect}
                    data={dataVenue}
                />
            ))
        }

        return (
            <g className="venues"> {ret}</g>
        )
    }
}
// 
interface PropsVenue {
    renderPos: v2;
    renderSize: v2;
    vid: string;
    venue: IVenue;
    day: number;
    time: number;
    modePopulation: MODE_POPULATION,
    modeVenuePopLine: MODE_VENUE_POPULATION,
    modeVenuePopRect: MODE_VENUE_POPULATION,
    data: number[] | null;
}
class Venue extends React.Component<PropsVenue, {}>{
    getMaxVal(modeMax: MODE_VENUE_POPULATION): number {
        const { vid, day, modePopulation } = this.props;

        const dictMax = (modePopulation === MODE_POPULATION.STATIC) ?
            maxNumVenueTimePop.static : maxNumVenueTimePop.dynamic

        let maxVal: number = 0;
        switch (modeMax) {
            case MODE_VENUE_POPULATION.RATIO:
                maxVal = dictMax.ratio[vid][day];
                break;
            case MODE_VENUE_POPULATION.VENUE:
                maxVal = dictMax.venues[day];
                break;
            case MODE_VENUE_POPULATION.TOTAL:
                maxVal = dictMax.total[day];
                break;
        }
        return maxVal
    }
    render() {
        const { venue, vid, renderPos, renderSize, day, time, data } = this.props

        const transform: string = `translate(${renderPos.a}px, ${renderPos.b}px)`

        const popRect = data !== null ? (
            <VenuePopulationRect
                size={renderSize}
                time={time}
                maxVal={this.getMaxVal(this.props.modeVenuePopRect)}
                data={data}
            />) : ''
        const popLine = data !== null ? (
            <VenuePopulationLine
                vid={vid}
                day={day}
                size={renderSize}
                maxVal={this.getMaxVal(this.props.modeVenuePopLine)}
                data={data}
            />) : ''
        return (
            <g style={{ transform: transform }}>
                {popRect}
                {popLine}
                <rect
                    width={renderSize.a}
                    height={renderSize.b}
                    fill={styleMap.venueFill}
                    stroke={styleMap.venueStroke}
                    strokeWidth={styleMap.venueStrokeWidth}
                />
                <text y={13}>
                    {venue.name}
                </text>
            </g>
        )
    }
}
// 以百分比进度条的形式, 显示场馆在一个时刻的人数信息
interface PropsVenuePopulationRect {
    size: v2;
    time: number;
    maxVal: number;
    data: number[];
}
class VenuePopulationRect extends React.Component<PropsVenuePopulationRect, {}>{
    ref: SVGRectElement | null = null;

    getHeight() {
        const { time, size, data, maxVal } = this.props;
        return maxVal !== 0 ? data[time] / maxVal * size.b : 0
    }
    componentDidMount() {
        const height = this.getHeight()
        d3.select(this.ref)
            .attr('y', this.props.size.b - height)
            .attr('height', height)
    }
    componentDidUpdate() {
        const height = this.getHeight()
        d3.select(this.ref)
            .transition()
            .duration(100)
            .attr('y', this.props.size.b - height)
            .attr('height', height)
    }
    render() {
        return (
            <rect
                fill={styleMap.venueRectFill}
                ref={(ref: SVGRectElement) => this.ref = ref}
                width={this.props.size.a}
            />
        )
    }
}
// 折线图, 显示场馆在一天中的人数变化
interface PropsVenuePopulationLine {
    vid: string;    // 用来获取数据
    day: number;
    size: v2;
    maxVal: number;
    data: number[];
}
class VenuePopulationLine extends React.Component<PropsVenuePopulationLine, {}>{
    ref: SVGPathElement | null = null;
    scaleX: any = null;
    scaleY: any = null;
    area: any = null;

    updateScaleY() {
        const { size, maxVal } = this.props
        if (maxVal !== 0) {
            this.scaleY = d3.scaleLinear()
                .domain([0, maxVal])
                .range([size.b - 1, 0]);
        } else {
            this.scaleY = () => size.b - 1
        }
    }
    componentDidMount() {
        // 时间序列人数
        const { size, data } = this.props

        this.scaleX = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, size.a])
        this.updateScaleY()

        this.area = d3.area()
            .x((d, i) => this.scaleX(i))
            .y0(this.scaleY(0))
            .y1((d: any) => this.scaleY(d))

        d3.select(this.ref)
            .datum(data)
            .attr('d', this.area)
    }
    componentDidUpdate() {
        this.updateScaleY()
        // const data: number[] = dataVenueTimePopulation[this.props.vid][this.props.day]
        const { data } = this.props;
        d3.select(this.ref)
            .datum(data)
            .attr('d', this.area)
    }
    render() {
        return (
            <path
                ref={(ref: SVGPathElement) => { this.ref = ref }}
                fill={styleMap.venueLineFill}
            ></path>
        )
    }
}
