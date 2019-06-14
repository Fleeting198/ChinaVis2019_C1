import * as React from "react";
import { Progress, Tooltip, Row, Col, Divider } from 'antd'
import ReactEcharts from 'echarts-for-react';

interface Props {
    day: number
}
export default class Dashboard extends React.Component<Props, {}>{
    chartRef: any = null;
    chartInstance: any = null;

    componentDidMount() {
        this.chartInstance = this.chartRef.getEchartsInstance();
    }

    getData(day: number) {
        let dataDay = [[
            { value: 52, name: '工作人员' },
            { value: 292, name: '嘉宾' },
            { value: 2289, name: '参会者' },
            { value: 931, name: '类组委会' },
        ], [
            { value: 26, name: '工作人员' },
            { value: 329, name: '嘉宾' },
            { value: 2883, name: '参会者' },
            { value: 1196, name: '类组委会' },
        ], [
            { value: 45, name: '工作人员' },
            { value: 210, name: '嘉宾' },
            { value: 2501, name: '参会者' },
            { value: 174, name: '类组委会' },
        ]]
        return dataDay[day]
    }
    getData2() {
        return [
            { value: 64, name: '工作人员' },
            { value: 326, name: '嘉宾' },
            { value: 2940, name: '参会者' },
            { value: 1926, name: '类组委会' },
        ]
    }
    getOption() {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },

            series: [{
                name: '人员类型',
                type: 'pie',
                radius: ['45%', '70%'],
                label: {
                    show: true,
                    position: 'inner'
                },
                labelLine: {
                    show: false
                },
                // avoidLabelOverlap: false,
                data: this.getData(this.props.day)
            }]
        }
    }
    getOption2() {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            series: [{
                name: '人员类型',
                type: 'pie',
                radius: ['45%', '70%'],
                label: {
                    show: true,
                    position: 'inner'
                },
                labelLine: {
                    show: false
                },
                // avoidLabelOverlap: false,
                data: this.getData2()
            }]
        }
    }
    render() {
        return (
            <div className="material-card" id="dashboard" >
                <div>
                    <p>各天到场人数占总人数百分比</p>

                    <Row>
                        <Col span={6}>第一天:</Col>
                        <Col span={18}>
                            <Tooltip title="第一天: 3564人 / 总共: 5256人" >
                                <Progress percent={69} />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>第二天:</Col>
                        <Col span={18}>
                            <Tooltip title="第二天: 4434人 / 总共: 5256人" >
                                <Progress percent={84} />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>第三天:</Col>
                        <Col span={18}>
                            <Tooltip title="第三天: 2930人 / 总共: 5256人" >
                                <Progress percent={56} />
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
                <Divider />
                <div >
                    总人员构成
                    <ReactEcharts
                        ref={e => { this.chartRef = e }}
                        option={this.getOption2()}
                        style={{ width: '234px', height: '234px' }}
                    />
                </div>
                <div >
                    当天人员构成
                    <ReactEcharts
                        ref={e => { this.chartRef = e }}
                        option={this.getOption()}
                        style={{ width: '234px', height: '234px' }}
                    />
                </div>
            </div>
        )
    }
}