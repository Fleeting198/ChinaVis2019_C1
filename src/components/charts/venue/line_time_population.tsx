import * as React from 'react';
import ReactEcharts from 'echarts-for-react';
import { dataTimesIntervalClamp } from '../../../data/data_time';
import { EChartOption } from 'echarts';
import { dataVenues } from '../../../data/venue';
import { MODE_POPULATION } from '../../../types/interfaces';
import { Button } from 'antd';


interface Props {
    width: number;
    height: number;
    day: number;
    modePopulation: MODE_POPULATION;
}
interface State {
    data: any;
}
export default class LineTimePopulation extends React.Component<Props, State>{
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

        this.updataData()
        this.handleSelectAllLegends = this.handleSelectAllLegends.bind(this)
        this.handleUnSelectAllLegends = this.handleUnSelectAllLegends.bind(this)
    }
    updataData() {
        const { modePopulation, day } = this.props
        const modePop = (modePopulation === MODE_POPULATION.STATIC) ? 'static' : 'dynamic'
        const url = `./data/venue_time_pop_${modePop}/data${day + 1}.json`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                this.setState({ data: data })
            })
    }
    componentDidMount() {
        this.chartInstance = this.chartRef.getEchartsInstance();
    }
    componentDidUpdate(preProps: Props) {
        if (this.props.day !== preProps.day || this.props.modePopulation !== preProps.modePopulation) {
            this.updataData()
        }
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
        const { data } = this.state

        let ret: EChartOption.SeriesLine[] = [];
        for (const vid in data) {
            if (vid === 'hallway1' || vid === 'hallway2') { continue }
            const arr: number[] = data[vid];
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
