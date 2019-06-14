export interface EchartsParamsPieSelectChanged_selected {
    [key: string]: boolean;
}
export interface EchartsParamsPieSelectChanged {
    name: string;
    selected: EchartsParamsPieSelectChanged_selected;
    type: string;
}
export interface ObjBoolean {
    [key: string]: boolean;
}
export interface v2 {
    a: number;
    b: number;
}
export interface StyleMap {
    venueStroke: string;
    venueStrokeWidth: string;
    venueFill: string;
    gridStroke: string;
    wallFill: string;
    wallStroke: string;
    individRad: number;
    individFill: string;
}
// id: [sid, time]
export interface IDataDayIDTimeSID {
    [key: string]: [string, number][];
}
export interface DayTimeSpan {
    day: number
    st: number
    ed: number
}
export interface TimeSpan {
    st: number
    ed: number
}
export interface MarkedPosition {
    x: number;
    y: number;
    ID: string;
    marked: boolean;
}
export interface Position {
    x: number;
    y: number;
}
export interface PositionFloor {
    floor: number;
    x: number;
    y: number;
}
export interface PositionPerson {
    ID: string;
    x: number;
    y: number;
}
export interface PositionPersonFloor {
    floor: number;
    ID: string;
    x: number;
    y: number;
}
export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface AreaFloor {
    floor: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
export enum MODE_VENUE_POPULATION {
    RATIO,  // 各自会场的最大值为max
    VENUE,  // 全体会场的最大值为max
    TOTAL,  // 当前的所有人数为max
}
export enum MODE_POPULATION {
    STATIC,
    DYNAMIC
}
export interface IDataTimePop {
    [key: string]: number[];  // key: floor.x.y, value: series
}
