import * as React from 'react';
import { Radio, Row } from 'antd'
import { chNum } from './data/data_misc'
import 'antd/dist/antd.css';
import './App.css';
import SectionVenue from './components/venue/section_venue'
import Dashboard from './components/charts/dashboard'

interface Props {

}
interface State {
  day: number
}
export default class App extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);

    this.state = {
      day: 0
    };

    this.handleDayChange = this.handleDayChange.bind(this);
  }
  handleDayChange(e: any) {
    this.setState({
      day: parseInt(e.target.value)
    });
  }
  render() {
    const { day } = this.state
    return (
      <div className="app" >

        {/* data select: day */}
        <div className="control-panel material-card" id="control-app">
          <Row type="flex" justify="center">
            <Radio.Group name='day' defaultValue={this.state.day}
              onChange={this.handleDayChange}>
              <Radio.Button value={0}>第{chNum[0]}天</Radio.Button>
              <Radio.Button value={1}>第{chNum[1]}天</Radio.Button>
              <Radio.Button value={2}>第{chNum[2]}天</Radio.Button>
            </Radio.Group>
          </Row>
        </div>
        <SectionVenue day={day} />
        <Dashboard day={day} />
      </div>
    );
  }
}
