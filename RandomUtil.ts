/*
 * @Author: yangchao
 * @Date: 2023-01-13 09:12:04
 * @LastEditors: 张清鹇
 * @Description: 
 * @LastEditTime: 2023-01-13
 * @FilePath: \spx\assets\spx\scripts\Manager\Random.ts
 */

import * as cc from 'cc';

export class RandomUtil {
    /**非静态 */
    /** 设置用于随机数生成器的种子，如果不设置则实际是取当前时间毫秒数*/
    private seed: number;
    /**构造 */
    public constructor(seed?: number) {
        this.seed = seed || Date.now();
    }
    /** 返回一个随机数，在0.0～1.0之间*/
    public get value(): number {
        return this.range(0, 1);
    }
    /** 设置种子 */
    public srand(seed?: number) {
        this.seed = seed || Date.now();
    }
    /** 返回半径为1的圆内的一个随机点*/
    public get insideUnitCircle(): cc.Vec3 {
        let str: string = '';
        str.startsWith('res_')
        let randomAngle: number = this.range(0, 360);
        let randomDis: number = this.range(0, 1);
        let randomX: number = randomDis * Math.cos(randomAngle * Math.PI / 180);
        let randomY: number = randomDis * Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec3(randomX, randomY, 0);
    }
    /**返回半径为1的圆边的一个随机点 */
    public get onUnitCircle(): cc.Vec3 {
        let randomAngle: number = this.range(0, 360);
        let randomX: number = Math.cos(randomAngle * Math.PI / 180);
        let randomY: number = Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec3(randomX, randomY, 0);
    }
    /** 返回一个在min和max之间的随机浮点数*/
    public range(min = 0, max = 1): number {
        if (!this.seed && this.seed != 0) {
            this.seed = Date.now();
        }
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        let rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }

    /**静态 */
    /** 设置用于随机数生成器的种子，如果不设置则实际是取当前时间毫秒数*/
    private static seed: number;
    /** 返回一个随机数，在0.0～1.0之间*/
    public static get value(): number {
        return this.range(0, 1);
    }
    /** 设置种子 */
    public static srand(seed: number) {
        this.seed = seed;
    }
    /** 返回半径为1的圆内的一个随机点*/
    public static get insideUnitCircle(): cc.Vec3 {
        let randomAngle: number = this.range(0, 360);
        let randomDis: number = this.range(0, 1);
        let randomX: number = randomDis * Math.cos(randomAngle * Math.PI / 180);
        let randomY: number = randomDis * Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec3(randomX, randomY, 0);
    }
    /**返回半径为1的圆边的一个随机点 */
    public static get onUnitCircle(): cc.Vec3 {
        let randomAngle: number = this.range(0, 360);
        let randomX: number = Math.cos(randomAngle * Math.PI / 180);
        let randomY: number = Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec3(randomX, randomY, 0);
    }
    /**
     * @description: 返回一个在>=min, <max的随机浮点数
     * @param {*} min 最小值
     * @param {*} max 最大值
     * @return {*} 随机数
     */
    public static range(min = 0, max = 1): number {
        if (!this.seed && this.seed != 0) {
            this.seed = Date.now();
        }
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        let rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }
    /**
     * @description: 公平的洗牌算法, 一个数在每个位置出现的概率基本相同，一个数在所有位置上出现的概率接近1 ± 0.01 
     * @param {any} arr 需要洗牌的数组
     * @return {*}  洗好牌的数组
     */
    public static shuffle(arr: any[]): any[] {
        let len = arr.length;
        for (let i = 0; i < len - 1; i++) {
            let idx = Math.floor(this.range(0, 1) * (len - i));
            let temp = arr[idx];
            arr[idx] = arr[len - i - 1];
            arr[len - i - 1] = temp;
        }
        return arr;
    }
    /**
     * @description: 带权重的随机数
     * @param {number} weightArr 权重数组
     * @return {*} 返回下标
     */
    public static weightRandom(weightArr: number[]): number {
        let weightSum: number = 0;
        for (let i = 0; i < weightArr.length; i++) {
            weightSum += weightArr[i];
        }
        let randomNum: number = Math.floor(this.range(0, weightSum));
        let weightSumTemp: number = 0;
        for (let i = 0; i < weightArr.length; i++) {
            weightSumTemp += weightArr[i];
            if (randomNum < weightSumTemp) {
                return i;
            }
        }
        return -1;
    }

}