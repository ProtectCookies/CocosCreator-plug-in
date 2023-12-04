/*
 * @Date: 2023-4-12 17:11:30
 * @LastEditors: yc
 * @Description: 
 * @LastEditTime: 2023-05-19 11:51:25
 * @FilePath: \zxyc\assets\zxyc\scripts\Tools\UIHitMask.ts
 */

import { _decorator, Component, Node, Label, Color } from 'cc';
const { ccclass, property, menu, requireComponent, disallowMultiple, executeInEditMode } = cc._decorator;
import * as cc from 'cc';
import { EDITOR } from 'cc/env';

@ccclass('UIHitMask')
@requireComponent(cc.Sprite)
export default class UIHitMask extends cc.Component {
    private uiTransform: cc.UITransform = null;
    /**
     * 像素数据
     */
    protected maskData: Uint8Array = null;
    onLoad() {
        this.uiTransform = this.node.getComponent(cc.UITransform);
    }
    start() {

    }

    /**
     * @description: 设置hitmask
     * @param {string} path hitmask路径
     * @return {*}
     */
    public setUIHitMask(path: string) {
        cc.resources.load(path, cc.BufferAsset, (err, data) => {
            if (err) {
                this.maskData = null;
                // cc.error(err.message || err);
                return;
            }
            this.maskData = new Uint8Array(data.buffer());
        });
    }

    /**
    * @description: 获取点击的像素是不是透明的
    * @param {cc} event 点击事件
    * @return {*}  {boolean} 是否透明
    */
    public isLucency(event: cc.EventTouch): boolean {
        if (!this.maskData){
            return true;
        }
        // 获取触摸点在世界坐标系下的位置
        const touchPos = event.getUILocation();
        let touch = cc.v3(touchPos.x, touchPos.y, 0);
        // 转换成节点坐标
        let localPos = this.uiTransform.convertToNodeSpaceAR(touch);
        localPos = cc.v3(Math.floor(localPos.x * 0.5), Math.floor(localPos.y * 0.5), 0);
        // 获取基于左上角的坐标
        // 获取锚点
        const anotherX = this.uiTransform.anchorX;
        const anotherY = this.uiTransform.anchorY;
        // 获取图片大小
        const width = Math.floor(this.uiTransform.contentSize.width * 0.5);
        const height = Math.floor(this.uiTransform.contentSize.height * 0.5);

        const res_x = Math.floor(width * anotherX + localPos.x);
        const res_y = Math.floor(height * anotherY + localPos.y);

        const index = res_y * width + res_x;
        const index2 = Math.floor(index / 8);
        const index3 = index % 8;
        // cc.log('x:', res_x, 'y:', res_y, 'index:', index2, 'lenght', this.maskData.length,
        // 'width',width,'height',height
        // );

        if (index2 >= 0 && index2 < this.maskData.length) {
            const byte = this.maskData[index2];
            // cc.log('该点alpha',byte);
            // if (((byte >> index3) & 0x1) > 0) {
            //     cc.log('不透明')
            // }
            // else {
            //     cc.log('透明')
            // }
            return ((byte >> index3) & 0x1) > 0;
        }

        // cc.log('原始x:', localPos.x, '原始y:', localPos.y);


        return false;
    }

}



