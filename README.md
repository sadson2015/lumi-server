# lumi-server 绿米服务端

负责与绿米网关建立通讯

## 安装

## 配置

config.js

## 可用设备

### 多功能网关 Gateway

#### 属性
1. rgb - 灯光颜色
2. brightness - 灯光亮度
3. rgbb - 同时设置颜色和亮度

#### 事件
1. heartbeat - 心跳

### 门窗传感器 Magnet

#### 属性
1. status - 打开/关闭(open/close)(只读)
2. voltage - (只读)

#### 事件
1. open - 当打开时触发
2. close - 当关闭时触发

### 人体传感器 Motion

#### 属性
1. voltage - (只读)

#### 事件
1. motion - 当有人移动时触发
2. no_motion - 当一定时间无人移动时触发

### 插座(ZigBee) Plug

#### 属性
1. voltage - (只读)
2. status - (只读)
3. inuse - (只读)
4. consumed - (只读)
5. power - (只读)

### 无线开关 Switch

#### 属性
1. voltage - (只读)

#### 方法
1. click - 模拟按下
2. doubleClick - 模拟连按两次
3. longClick - 模拟长按，可设置长按时长，默认1秒，最长10秒

#### 事件
1. click - 当按下时触发
2. doubleClick - 当连按两次时触发
3. longClickPress - 当长按开始时触发
4. longClickRelease - 当长按松开时触发