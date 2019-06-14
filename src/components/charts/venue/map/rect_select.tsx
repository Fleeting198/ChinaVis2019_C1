import * as React from 'react';
import { v2, Area } from '../../../../types/interfaces';
import { styleMap } from '../../../../data/data_misc'
import * as d3 from 'd3'

interface Props {
    size: v2
    sizeBlock: number
    onChange: (a: Area | null) => void
    onStart: (a: number) => void
    ID: number
    controlID: number
}
interface State {
    st: [number, number] | null;
    ed: [number, number] | null;

    dragging: boolean
}
export default class RectSelect extends React.Component<Props, State> {
    ref: SVGRectElement | null = null
    selection: Area | null = null
    sizePixel: v2 = { a: this.props.size.a * this.props.sizeBlock, b: this.props.size.b * this.props.sizeBlock }
    sizePixel_s: v2 = { a: this.sizePixel.a - 1, b: this.sizePixel.b - 1 }
    minP: [number, number] = [0, 0]
    sizeR: [number, number] = [0, 0]

    constructor(props: Props) {
        super(props)

        this.state = {
            st: null,
            ed: null,
            dragging: false
        }

        this.handleSelectionChange = this.handleSelectionChange.bind(this)
        this.handleSelectionStart = this.handleSelectionStart.bind(this)
    }
    setSelectionFromRect(p1: [number, number], p2: [number, number]) {
        const { sizeBlock } = this.props

        let x1, y1, x2, y2    // 左上角和右下角
        if (p1[0] <= p2[0]) {
            x1 = p1[0]
            x2 = p2[0]
        } else {
            x1 = p2[0]
            x2 = p1[0]
        }
        if (p1[1] <= p2[1]) {
            y1 = p1[1]
            y2 = p2[1]
        } else {
            y1 = p2[1]
            y2 = p1[1]
        }
        this.minP = [x1, y1]
        this.sizeR = [x2 - x1, y2 - y1]

        let bx1 = Math.floor(x1 / sizeBlock),
            by1 = Math.floor(y1 / sizeBlock),
            bx2 = Math.ceil(x2 / sizeBlock),
            by2 = Math.ceil(y2 / sizeBlock)

        let x = bx1 < bx2 ? bx1 : bx2,
            y = by1 < by2 ? by1 : by2,
            w = bx2 - bx1,
            h = by2 - by1

        this.selection = {
            x: x,
            y: y,
            width: w,
            height: h
        }
    }
    handleSelectionChange() {
        this.props.onChange(this.selection)
    }
    handleSelectionStart() {
        this.props.onStart(this.props.ID)
    }
    componentDidMount() {
        const ctx = d3.select(this.ref)
        ctx.on('mousedown', () => {
            if (!this.state.dragging) {
                // console.log('start selection')
                let st = d3.mouse(this.ref!)
                this.startSelection(st)
            }
        })
        ctx.on('mousemove', () => {
            if (this.state.dragging) {
                let ed = d3.mouse(this.ref!)
                this.setSelectionFromRect(this.state.st!, ed)
                this.setState({ ed: ed })
            }
        })
        ctx.on('mouseup', () => {
            console.log('mouse up')
            if (this.state.dragging) {
                // this.selection 会先于 state 更新, 逻辑 先于 表现
                let ed = d3.mouse(this.ref!)

                if (Math.abs(ed[0] - this.state.st![0]) < 2 &&
                    Math.abs(ed[1] - this.state.st![1]) < 2) {
                    this.clearSelection()
                } else {
                    // console.log('create selection')
                    this.createSelection(ed)
                }
            }
        })
        // ctx.on('mouseout', () => {
        //     console.log('mouseleave')
        //     if (this.state.dragging) {
        //         this.clearSelection()
        //     }
        // })
    }
    startSelection(st: [number, number]) {
        this.handleSelectionStart()
        this.setState({
            dragging: true,
            st: st,
            ed: null
        })
    }
    clearSelection() {
        // console.log('clear selection')
        this.selection = null;
        this.handleSelectionChange()
        this.setState({
            st: null,
            ed: null,
            dragging: false,
        })
    }
    createSelection(ed: [number, number]) {
        this.setSelectionFromRect(this.state.st!, ed)
        this.handleSelectionChange()
        this.setState({
            dragging: false,
            ed: ed
        })
    }
    componentDidUpdate() {
        if (this.props.controlID !== this.props.ID && this.state.st !== null) {
            this.clearSelection()
        }
    }
    render() {
        const { sizeBlock, size } = this.props
        const { st, ed } = this.state;

        let border: any = '';
        // let rects: any[] = [];
        if (st !== null && ed !== null && this.selection !== null) {
            border = (
                <rect
                    x={this.minP[0]}
                    y={this.minP[1]}
                    width={this.sizeR[0]}
                    height={this.sizeR[1]}
                    fill={styleMap.selectHandlerFill}
                    stroke={styleMap.selectHandlerStroke}
                    strokeDasharray={'5,5'}
                ></rect>
            )

            // const rects = [];
            // const x2 = this.selection.x + this.selection.width,
            //     y2 = this.selection.y + this.selection.height

            // for (let x = this.selection.x; x <= x2; x++) {
            //     for (let y = this.selection.y; y <= y2; y++) {
            //         rects.push((
            //             <rect
            //                 key={`${x}.${y}`}
            //                 x={x * sizeBlock}
            //                 y={y * sizeBlock}
            //                 width={sizeBlock}
            //                 height={sizeBlock}
            //                 fill={styleMap.selectRectFill}
            //                 stroke={styleMap.selectRectStroke}
            //             ></rect>
            //         ))
            //     }
            // }
        }

        return (
            <g className='rect-select'>
                <rect
                    ref={ref => this.ref = ref}
                    width={size.a * sizeBlock}
                    height={size.b * sizeBlock}
                    fill={'rgb(255,255,255,.0001)'}
                    stroke={'none'}
                >
                </rect>
                {/* {rects} */}
                {border}
            </g>
        )
    }
}
