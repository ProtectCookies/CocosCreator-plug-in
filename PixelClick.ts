/*
 * @Date: 2022-11-11 17:11:30
 * @LastEditors: yc
 * @Description: 
 * @LastEditTime: 2023-06-07 17:16:42
 * @FilePath: \zxyc\assets\zxyc\scripts\Tools\PixelClick.ts
 */

import { _decorator, Component, Node, Label, Color } from 'cc';
const { ccclass, property, menu, requireComponent, disallowMultiple, executeInEditMode } = cc._decorator;
import * as cc from 'cc';
import { EDITOR } from 'cc/env';

@ccclass('PixelClick')
@requireComponent(cc.Sprite)
export default class PixelClick extends cc.Component {
    @property({ tooltip: "打印信息" })
    private consoleLog: boolean = false;
    private uiTransform: cc.UITransform = null;
    /**
     * 像素数据
     */
    protected pixelsData: Uint8Array = null;
    onLoad() {
        // this.target.on(cc.Node.EventType.TOUCH_END, this.onTargetClick, this);
        // this.target.on(cc.Node.EventType.TOUCH_MOVE, this.onTargetClick, this);
        this.uiTransform = this.node.getComponent(cc.UITransform);
    }
    start() {
        // this.pixelsData = this.getPixelsData(this.node);
    }

    /**
     * @description: 刷新像素数据，在更改sprite图片之后调用，请勿频繁调用，会影响性能，
     * @return {*}
     */
    public updatePixelsData() {
        this.pixelsData = this.getPixelsData(this.node);
    }

    /**
     * @description: 获取点击的像素是不是透明的
     * @param {cc} event 点击事件
     * @param {number} threshold 透明度阈值 0-255
     * @return {*}  {boolean} 是否透明
     */
    public isLucency(event: cc.EventTouch, threshold: number = 0): boolean {
        // 点击位置
        const touchPos = cc.v3(event.getUILocation().x, event.getUILocation().y, 0);
        const node = this.node.getComponent(cc.UITransform);
        const localPos = this.uiTransform.convertToNodeSpaceAR(touchPos);
        // 不在节点内
        if (!node.getBoundingBoxToWorld().contains(cc.v2(touchPos.x, touchPos.y))) {
            return;
        }

        // 获取像素数据
        if (!this.pixelsData) {
            this.pixelsData = this.getPixelsData(this.node);
        }

        // 截取像素颜色
        let x = localPos.x + node.anchorX * node.width;
        let y = -(localPos.y - node.anchorY * node.height);
        const index = (node.width * 4 * Math.floor(y)) + (4 * Math.floor(x))
        const colors = this.pixelsData.slice(index, index + 4);


        if (this.consoleLog) {
            cc.log(`---------- 点击信息 ----------`);
            cc.log(`基于世界的坐标：\t${touchPos.toString()}`);
            cc.log(`基于左上角的坐标：\t${cc.v2(x, y).toString()}`);
            cc.log(`基于锚点的坐标：\t${localPos.toString()}`);
            cc.log(`像素下标：\t${index}`);
            cc.log(`颜色值：R：${colors[0]}, G：${colors[1]}, B：${colors[2]}, A：${colors[3]}`);
            cc.log(`------------------------------`);
        }
        if (colors[3] >= threshold) {
            return true;
        }
        return false;
    }
    /**
     * 点击回调
     * @param event 
     */
    private onTargetClick(event: cc.EventTouch) {
        // 点击位置
        const touchPos = cc.v3(event.getUILocation().x, event.getUILocation().y, 0);
        const node = this.node.getComponent(cc.UITransform);
        const localPos = this.uiTransform.convertToNodeSpaceAR(touchPos);

        // 不在节点内
        if (!node.getBoundingBoxToWorld().contains(cc.v2(touchPos.x, touchPos.y))) {
            return;
        }

        // 获取像素数据
        if (!this.pixelsData) {
            this.pixelsData = this.getPixelsData(this.node);
        }

        // 截取像素颜色
        let x = localPos.x + node.anchorX * node.width;
        let y = -(localPos.y - node.anchorY * node.height);
        const index = (node.width * 4 * Math.floor(y)) + (4 * Math.floor(x));
        const colors = this.pixelsData.slice(index, index + 4);

        cc.log(`---------- 点击信息 ----------`);
        cc.log(`基于世界的坐标：\t${touchPos.toString()}`);
        cc.log(`基于左上角的坐标：\t${cc.v2(x, y).toString()}`);
        cc.log(`基于锚点的坐标：\t${localPos.toString()}`);
        cc.log(`像素下标：\t${index}`);
        cc.log(`颜色值：`);
        cc.log(`\t- R：${colors[0]}`);
        cc.log(`\t- G：${colors[1]}`);
        cc.log(`\t- B：${colors[2]}`);
        cc.log(`\t- A：${colors[3]}`);
        cc.log(`------------------------------`);
    }

    /**
     * 获取像素数据
     * @param node 节点
     */
    private getPixelsData(node: cc.Node) {
        let frame = node.getComponent(cc.Sprite).spriteFrame;

        // 获取图集的rect，里面包含了图像的位置，宽高等信息
        return this.readPixels(frame.rect.x, frame.rect.y, this.uiTransform.width, this.uiTransform.height, frame);

    }
    private readPixels(x = 0, y = 0, width: number, height: number, tex: cc.SpriteFrame) {
        // 这里巨坑，getGFXTexture会获取到他图集的纹理，而不是我们想要的精灵纹理
        // 所以在上面设置的起点的x，y就是他在图集里面的位置
        const gfxTexture = tex.getGFXTexture();
        if (!gfxTexture) {
            return null;
        }
        // RGBA四个数据 乘 图片的宽高
        const needSize = 4 * width * height;
        let buffer = new Uint8Array(needSize);
        const gfxDevice = cc.director.root.device;
        const bufferViews: ArrayBufferView[] = [];
        const regions: cc.gfx.BufferTextureCopy[] = [];
        // 通过设置BufferTextureCopy里面的数据来选择要copy的区域
        const region0 = new cc.gfx.BufferTextureCopy();
        region0.texOffset.x = Math.round(x);
        region0.texOffset.y = Math.round(y);
        region0.texExtent.width = Math.round(width);
        region0.texExtent.height = Math.round(height);
        regions.push(region0);

        bufferViews.push(buffer);
        gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, regions);
        // 把数据缓冲设置到texture上
        /*let dstTexture = new cc.Texture2D();
        dstTexture.reset({
            width: width,
            height: height,
            format: cc.Texture2D.PixelFormat.RGBA8888,
            mipmapLevel: 0
        });
        dstTexture.uploadData(buffer);*/
        // 设置到测试用的精灵上
        // let spriteFrame = new cc.SpriteFrame();
        // spriteFrame.texture = dstTexture;
        // this.node.getChildByName('sp_test').getComponent(cc.Sprite).spriteFrame = spriteFrame;
        return buffer;
    }
    update(dt) {

    }
}

