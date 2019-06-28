export interface IVenue {
    name: string;
    floor: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface IDataVenues {
    [key: string]: IVenue
}
export interface IWalls {
    floor: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
export const dataVenues: IDataVenues = {
    "10001": { "name": "\u5206\u4f1a\u573aA", "floor": 1, "x": 1, "y": 2, "width": 5, "height": 2 },
    "10002": { "name": "\u5206\u4f1a\u573aB", "floor": 1, "x": 1, "y": 4, "width": 5, "height": 2 },
    "10003": { "name": "\u5206\u4f1a\u573aC", "floor": 1, "x": 1, "y": 6, "width": 5, "height": 2 },
    "10004": { "name": "\u5206\u4f1a\u573aD", "floor": 1, "x": 1, "y": 8, "width": 5, "height": 2 },
    "10005": { "name": "\u7b7e\u5230\u5904", "floor": 1, "x": 2, "y": 12, "width": 4, "height": 2 },
    "10006": { "name": "\u6d77\u62a5\u533a", "floor": 1, "x": 7, "y": 3, "width": 2, "height": 7 },
    "10007": { "name": "\u6276\u68af1", "floor": 1, "x": 10, "y": 1, "width": 2, "height": 1 },
    "10008": { "name": "\u5395\u62401", "floor": 1, "x": 10, "y": 4, "width": 2, "height": 2 },
    "10009": { "name": "room1", "floor": 1, "x": 10, "y": 6, "width": 2, "height": 4 },
    "10010": { "name": "room2", "floor": 1, "x": 10, "y": 10, "width": 2, "height": 2 },
    "10011": { "name": "\u6276\u68af2", "floor": 1, "x": 10, "y": 14, "width": 2, "height": 1 },
    "10012": { "name": "\u5c55\u5385", "floor": 1, "x": 15, "y": 2, "width": 4, "height": 10 },
    "10013": { "name": "\u4e3b\u4f1a\u573a", "floor": 1, "x": 19, "y": 2, "width": 10, "height": 10 },
    "10014": { "name": "\u670d\u52a1\u53f0", "floor": 1, "x": 19, "y": 14, "width": 2, "height": 2 },
    "10015": { "name": "room3", "floor": 1, "x": 21, "y": 14, "width": 4, "height": 2 },
    "10016": { "name": "room4", "floor": 1, "x": 25, "y": 14, "width": 2, "height": 2 },
    "10017": { "name": "\u5395\u62402", "floor": 1, "x": 27, "y": 14, "width": 2, "height": 2 },

    "20001": { "name": "\u9910\u5385", "floor": 2, "x": 1, "y": 2, "width": 5, "height": 8 },
    "20002": { "name": "room5", "floor": 2, "x": 1, "y": 10, "width": 5, "height": 2 },
    "20003": { "name": "\u4f11\u95f2\u533a", "floor": 2, "x": 0, "y": 13, "width": 6, "height": 3 },
    "20004": { "name": "\u6276\u68af3", "floor": 2, "x": 10, "y": 1, "width": 2, "height": 1 },
    "20005": { "name": "\u5395\u62403", "floor": 2, "x": 10, "y": 4, "width": 2, "height": 2 },
    "20006": { "name": "room6", "floor": 2, "x": 10, "y": 6, "width": 2, "height": 2 },
    "20007": { "name": "\u6276\u68af4", "floor": 2, "x": 10, "y": 14, "width": 2, "height": 1 },
}
export const dataWalls: IWalls[] = [
    { "floor": 1, "x": 0, "y": 0, "width": 19, "height": 1 },
    { "floor": 1, "x": 20, "y": 0, "width": 10, "height": 1 },
    { "floor": 1, "x": 0, "y": 1, "width": 10, "height": 1 },
    { "floor": 1, "x": 29, "y": 1, "width": 1, "height": 15 },
    { "floor": 1, "x": 0, "y": 1, "width": 1, "height": 12 },
    { "floor": 1, "x": 0, "y": 14, "width": 1, "height": 2 },
    { "floor": 1, "x": 1, "y": 10, "width": 5, "height": 2 },
    { "floor": 1, "x": 12, "y": 2, "width": 3, "height": 10 },
    { "floor": 1, "x": 1, "y": 15, "width": 1, "height": 1 },
    { "floor": 1, "x": 3, "y": 15, "width": 1, "height": 1 },
    { "floor": 1, "x": 6, "y": 15, "width": 1, "height": 1 },
    { "floor": 1, "x": 8, "y": 15, "width": 7, "height": 1 },
    { "floor": 1, "x": 16, "y": 15, "width": 1, "height": 1 },
    { "floor": 1, "x": 18, "y": 15, "width": 1, "height": 1 },

    { "floor": 2, "x": 0, "y": 0, "width": 12, "height": 1 },
    { "floor": 2, "x": 0, "y": 1, "width": 10, "height": 1 },
    { "floor": 2, "x": 0, "y": 2, "width": 1, "height": 11 },
    { "floor": 2, "x": 0, "y": 12, "width": 6, "height": 1 },
    { "floor": 2, "x": 12, "y": 0, "width": 1, "height": 15 },
    { "floor": 2, "x": 10, "y": 8, "width": 2, "height": 4 },
    { "floor": 2, "x": 6, "y": 15, "width": 7, "height": 1 },
]