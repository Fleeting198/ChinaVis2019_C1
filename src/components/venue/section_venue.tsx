import * as React from "react";
import MapVenue from './map/map'
import LineTimePopulation from './line_time_population';
import { MODE_POPULATION, DataPopulationEntitiesDay } from '../../types/interfaces';
import { Radio, Row } from 'antd'


// 负责场馆时序数据的状态管理
interface Props {
    day: number;
}
interface State {
    modePopulation: MODE_POPULATION;
    dataPopulationVenues: DataPopulationEntitiesDay | null;
    dataPopulationBlocks: DataPopulationEntitiesDay | null;
}
export default class SectionVenue extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)

        this.state = {
            modePopulation: MODE_POPULATION.STATIC,
            dataPopulationVenues: null,
            dataPopulationBlocks: null,
        }

        this.handleSelectModePopulation = this.handleSelectModePopulation.bind(this)
    }
    handleSelectModePopulation(value: any): void {
        value = value.target.value        //  radio group
        this.setState({ modePopulation: value })
    }
    componentDidMount() {
        this.loadDataPopulation()
    }
    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.modePopulation !== this.state.modePopulation ||
            prevProps.day !== this.props.day) {
            this.loadDataPopulation()
        }
    }
    async loadDataPopulation() {
        // 根据 day 和 数据类型 modePopulation (动态,静态) 来获取数据
        const { day } = this.props,
            { modePopulation } = this.state
        let dataPopulationVenues = null,
            dataPopulationBlocks = null
        try {
            const urlDataVenueTime = `./data/venue_time_pop_${modePopulation}/data${day + 1}.json`,
                urlDataBlockTime = `./data/block_time_pop_${modePopulation}/data${day + 1}.json`
            console.log(urlDataVenueTime, urlDataBlockTime);
            const t1 = fetch(urlDataVenueTime).then(res => res.json()),
                t2 = fetch(urlDataBlockTime).then(res => res.json());
            [dataPopulationVenues, dataPopulationBlocks] = await Promise.all([t1, t2])

        } catch (err) {
            console.warn(err)
        }
        this.setState({
            dataPopulationVenues: dataPopulationVenues,
            dataPopulationBlocks: dataPopulationBlocks
        })
        console.log('data loaded, set state');
    }
    render() {
        const { day } = this.props
        const { modePopulation, dataPopulationVenues, dataPopulationBlocks } = this.state   // 静态\活跃值

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
                            dataPopulationVenues={dataPopulationVenues}
                            dataPopulationBlocks={dataPopulationBlocks}
                        />
                    </Row>

                    <Row>
                        <LineTimePopulation
                            width={1076}
                            height={400}
                            // day={day}
                            // modePopulation={modePopulation}
                            dataPopulationVenues={dataPopulationVenues}
                        />
                    </Row>
                </div>
            </div>
        )
    }
}