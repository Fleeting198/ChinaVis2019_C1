import * as React from 'react';
import { List, Input, Button, Checkbox } from 'antd'

interface Props {
    list: Map<string, boolean>
    onAdd: (val: string) => void
    onRemove: (val: string) => void
    onMark: (val: string, checked: boolean) => void
}
interface State {
    ID2Add: string;
}
export default class WatchList extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)
        this.state = {
            ID2Add: ''
        }
        this.handleBtnAddClick = this.handleBtnAddClick.bind(this)
        this.handleActionDeleteClick = this.handleActionDeleteClick.bind(this)
        this.handleID2AddChange = this.handleID2AddChange.bind(this)
        this.handleMarkChange = this.handleMarkChange.bind(this)
    }
    // this.props.onAdd(val)
    handleBtnAddClick() {
        const { ID2Add } = this.state
        // 校验
        if (ID2Add.length !== 5) { return false }
        else {
            this.props.onAdd(this.state.ID2Add)
        }
    }
    handleActionDeleteClick(e: any) {
        this.props.onRemove(e.target.value)
    }
    handleID2AddChange(e: any) {
        this.setState({
            ID2Add: e.target.value
        })
    }
    handleMarkChange(e: any) {
        this.props.onMark(e.target.value, e.target.checked)
    }
    render() {
        const { list } = this.props
        let arr: string[] = []

        list.forEach((val, key) => {
            arr.push(key)
        })

        return (
            <div id="watch-list">
                <div>
                    <Input.Search
                        defaultValue={this.state.ID2Add}
                        style={{ width: '200px' }}
                        placeholder="输入用户名"
                        type="text"
                        enterButton="添加"
                        onChange={this.handleID2AddChange}
                        onSearch={this.handleBtnAddClick}
                    />
                </div>
                <div id="list-target">
                    <List
                        size="small"
                        dataSource={arr}
                        renderItem={item =>
                            <List.Item
                                actions={[
                                    <Button type="link" size="small" value={item} onClick={this.handleActionDeleteClick}>删除</Button>,
                                    <Checkbox value={item} onChange={this.handleMarkChange} />
                                ]}
                            >{item}</List.Item>
                        }
                    />
                </div>
            </div>
        )
    }
}