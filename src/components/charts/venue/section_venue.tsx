import * as React from "react";
import MapVenue from './map/map'
import LineTimePopulation from './line_time_population';
import { MODE_POPULATION } from '../../../types/interfaces';
import {  Radio, Row} from 'antd'


// 负责场馆时序数据的状态管理
interface Props {
    day: number;
}
interface State {
    modePopulation: MODE_POPULATION;
    dataVenue: any;
    dataBlock: any;
}
export default class SectionVenue extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)

        this.state = {
            modePopulation: MODE_POPULATION.STATIC,
            dataVenue: null,
            dataBlock: null,
        }

        this.handleSelectModePopulation = this.handleSelectModePopulation.bind(this)
    }
    handleSelectModePopulation(value: any): void {
        value = value.target.value        //  radio group
        this.setState({ modePopulation: value })
    }

    // TODO:用这个取代子组件自己发起的数据请求
    // TODO: 把数据get (block+venue) 放到这里来, 避免子元素重复更新, day+modePopulation, 想办法同步更新?, Promise
    async loadData() {
        const { day } = this.props,
            { modePopulation } = this.state

        const t1 = fetch(`./data/venue_time_pop_${modePopulation}/data${day + 1}.json`)
            .then(res => res.json()),
            t2 = fetch(`./data/block_time_pop_${modePopulation}/data${day + 1}.json`)
                .then(res => res.json())

        const [dataVenue, dataBlock] = await Promise.all([t1, t2])
        this.setState({ dataVenue: dataVenue, dataBlock: dataBlock })
    }
    render() {
        const { day } = this.props
        const { modePopulation } = this.state   // 静态\活跃值

        return (
            <div className="section" id="sec-venue">

                <div className="control-panel material-card" id="control-sec-venue">
                    <label>人数展示模式:
                    <Radio.Group name='mode-population' defaultValue={modePopulation}
                            onChange={this.handleSelectModePopulation}>
                            <Radio value={MODE_POPULATION.STATIC}>相对分布</Radio>
                            <Radio value={MODE_POPULATION.DYNAMIC}>活跃度</Radio>
                        </Radio.Group>
                    </label>
                </div>

                <div className="content">
                    <Row>
                        <MapVenue
                            sizeSVG={{ a: 1100, b: 405 }}
                            sizeBlock={25}
                            day={day}
                            modePopulation={modePopulation}
                        />
                    </Row>

                    <Row>
                        <LineTimePopulation
                            width={1076}
                            height={400}
                            day={day}
                            modePopulation={modePopulation}
                        />
                    </Row>
                </div>
            </div>
        )
    }
}