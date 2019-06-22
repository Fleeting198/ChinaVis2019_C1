export interface ObjBoolean {
    [key: string]: boolean;
}
// 2-d vector
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
// 参会人员ID 轨迹数据  id: [sid, time]
export interface IDataDayIDTimeSID {
    [key: string]: [string, number][];
}

// 时间
export interface DayTimeSpan {
    day: number
    st: number
    ed: number
}
export interface TimeSpan {
    st: number
    ed: number
}
// 地点
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
export interface MarkedPosition {
    x: number;
    y: number;
    ID: string;
    marked: boolean;
}
// area
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
// 
export enum MODE_VENUE_POPULATION {
    RATIO,  // 各自会场的最大值为max
    VENUE,  // 全体会场的最大值为max
    TOTAL,  // 当前的所有人数为max
}
export enum MODE_POPULATION {
    STATIC,
    DYNAMIC
}
// 外部json数据定义
// 对某一天一个实体集合中的每一个实体在各采样时间点的人流量描述
export interface DataPopulationEntitiesDay{
    [key:string]:number[];
}
