import * as React from 'react';
import ReactEcharts from 'echarts-for-react';
import { dataTimesIntervalClamp } from '../../data/data_time';
import { EChartOption } from 'echarts';
import { dataVenues } from '../../data/venue';
import { DataPopulationEntitiesDay } from '../../types/interfaces';
import { Button } from 'antd';


interface Props {
    width: number;
    height: number;
    dataPopulationVenues:DataPopulationEntitiesDay|null;
}
export default class LineTimePopulation extends React.Component<Props, {}>{
    chartRef: any = null;
    chartInstance: any = null;
    formRef: any = null;
    dataTimes: string[] = dataTimesIntervalClamp[300];
    seriesNames: string[] = []

    constructor(props: Props) {
        super(props);

        this.state = {
            data: null,
        };

        this.handleSelectAllLegends = this.handleSelectAllLegends.bind(this)
        this.handleUnSelectAllLegends = this.handleUnSelectAllLegends.bind(this)
    }
    componentDidMount() {
        this.chartInstance = this.chartRef.getEchartsInstance();
    }
    handleSelectAllLegends() {
        if (this.seriesNames.length === 0) { return }
        for (let name of this.seriesNames) {
            this.chartInstance.dispatchAction({
                type: 'legendSelect',
                name: name
            })
        }
    }
    handleUnSelectAllLegends() {
        if (this.seriesNames.length === 0) { return }
        for (let name of this.seriesNames) {
            this.chartInstance.dispatchAction({
                type: 'legendUnSelect',
                name: name
            })
        }
    }

    getSeriesLine(): EChartOption.SeriesLine[] {
        const { dataPopulationVenues } = this.props

        let ret: EChartOption.SeriesLine[] = [];
        for (const vid in dataPopulationVenues) {
            if (vid === 'hallway1' || vid === 'hallway2') { continue }
            const arr: number[] = dataPopulationVenues[vid];
            const name = dataVenues[vid].name
            this.seriesNames.push(name)
            const item: EChartOption.SeriesLine = {
                type: 'line',
                name: name,
                symbol: 'none',
                data: arr,
            };
            ret.push(item);
        }

        return ret;
    }
    getDefaultOption(): EChartOption {
        const dataXAxis = this.dataTimes;
        return {
            grid: {
                left: '4%',
                top: '4%',
                right: '0',
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    params.sort((a: any, b: any) => b.value - a.value)
                    let ret = ''
                    if (params.length <= 0) { return ret }
                    ret = params[0].axisValueLabel + '<br/>'
                    for (let i = 0; i < params.length && i < 10 && params[i].value > 0; i++) {
                        const param = params[i]
                        let icon = `<div class="tooltip-icon"style="background-color:${params[i].color};" ></div>`
                        ret += icon + param.seriesName + ':' + param.value + '<br/>'
                    }

                    return ret
                }
            },
            legend: {
                width: '40%',
                top: '10%',
                right: '0',
            },
            toolbox: {
                feature: {
                    magicType: { show: true, type: ['stack', 'tiled'] },
                    dataZoom: {},
                    restore: {},
                    saveAsImage: {},
                }
            },
            dataZoom: [{
                show: true,
                type: 'slider',
            }, {
                type: 'inside',
            }],
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: { onZero: true },
                data: dataXAxis
            }],
            yAxis: [{
                name: '人数',
                type: 'value',
            }],
            series: []
        };
    }
    getOption(): EChartOption {
        const option: EChartOption = this.getDefaultOption()
        const series: EChartOption.Series[] = this.getSeriesLine()
        option.series = series;
        return option
    }
    render() {
        return (
            <div
                className="chart-container material-card"
                id="container-line-time-population"
            >
                <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '14px' }}>人数变化</span>
                    <Button onClick={this.handleSelectAllLegends}
                        style={{ marginRight: '14px' }}
                    >全选</Button>
                    <Button onClick={this.handleUnSelectAllLegends}>全取消</Button>
                </div>
                <ReactEcharts
                    ref={e => { this.chartRef = e }}
                    option={this.getOption()}
                    style={{ width: this.props.width, height: this.props.height }}
                />
            </div >
        )
    }
}
