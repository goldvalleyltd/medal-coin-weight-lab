# Medal & Coin Weight Estimator (奖牌与挑战币克重与工艺评估器)

<div align="center">

![Gold Valley Logo](assets/branding/goldvalley-logo.svg)

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-brightgreen)](https://goldvalleyltd.github.io/medal-coin-weight-lab/)
[![Privacy Guaranteed](https://img.shields.io/badge/privacy-100%25%20Client--Side-success)](https://goldvalleyltd.github.io/medal-coin-weight-lab/)
[![Manufacturing Partner](https://img.shields.io/badge/factory-Gold%20Valley%20Ltd.-orange)](https://www.goldvalleyltd.com/)
[![Built with Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20r128-black.svg)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Client-Side 3D Physics, Neck Strain & Anti-Burst Packaging Estimator for Custom Sports Medals & Challenge Coins.**

[English](#english-documentation) | [中文说明](#中文文档)

</div>

---

## English Documentation

### 1. Overview & Mission (Engineering as Marketing)
In the custom awards and hardware merchandise industry, **Sports Medals** and **Military Challenge Coins** represent high-volume, high-value orders. However, buyers and designers often face major friction points:
1. **The Zinc vs. Brass Dilemma**: Buyers desire a heavy, noble feel but lack quantifiable awareness of the 30% weight difference and mold tonnage requirements between Zinc Alloy ($6.70\text{ g/cm}^3$) and Brass ($8.50\text{ g/cm}^3$);
2. **Air Freight Shock**: Dense metal items lead to high freight costs ($200\sim 260\text{ kg}$ per 2,000 medals), which can exceed production tooling budgets;
3. **Neck Strain & Loop Failure**: Oversized medals ($>150\text{ g}$) on narrow ribbons cause severe neck strain on fatigued marathon runners, while weak jump rings can snap under celebratory jumping loads ($2.5g$ impact);
4. **Edge DFM Conflicts**: Diamond-cut and rope edges require minimum thickness thresholds ($\ge 3.5\text{ mm}$) to avoid cutting through the base core.

**Medal & Coin Weight Estimator** solves this by delivering an interactive, browser-based 3D simulation tool that calculates exact metal body weights, tactile scores, neck strain ratings, and anti-burst export carton packing ($\le 18.0\text{ kg}$ per carton) — **all 100% locally in your browser**.

### 2. Key Features
* **Dual-Paradigm Architecture**: Instant toggle between **Challenge Coin Mode** (areal density, tactile score 1-100, 6 edge reeding patterns) and **Sports Medal Mode** (contour shapes, cutout ratios, neck ergonomics, jump ring safety ratios).
* **Precision Caliper Inspection Mode**: First-of-its-kind 3D digital vernier caliper biting the coin/medal edge with dynamic millimeter readings.
* **Anti-Burst Export Packaging & Logistics Engine**: Automatically calculates box quantities and packing ratios under the international safety limit ($\le 18.0\text{ kg}$ gross weight per master carton), comparing DHL/FedEx chargeable weight against Ocean LCL CBM.
* **100% Client-Side Privacy**: Zero cloud uploads. Your custom vectors and proprietary CAD files never leave your device.
* **1-Click High-Res DFM Report**: Exports 1200x1600 professional engineering assessment sheets with instant modal preview.

---

## 中文文档

### 1. 项目背景与工程使命
在赛事奖牌与军警挑战币的定制生产中，海外采购方常因克重认知盲区和运费超支陷入被动：
* 追求黄铜的厚重手感却只有锌合金预算；
* 忽视金属“纯重货”属性，空运费用占据总预算 30%~50%；
* 奖牌超重造成跑者勒颈或跳跃脱扣；
* 斜切钻石边等特种滚花因币厚不足切穿底板。

本项目由 **东莞市金瓒工艺制品有限公司（Gold Valley Ltd.）** 模具中心开源，为全球赛事主办方、独立设计师与外贸买家提供完全免费、纯客户端离线运行的物理与制造评估工具。

### 2. 核心功能矩阵
1. **品类双轨制专属切换**：
   - 🪙 **挑战币模式**：纯金属净重测算、纯铜 vs 锌合金面密度与沉手感打分（1~100 分）、边缘 6 种滚花齿形公差门槛；
   - 🥇 **赛事奖牌模式**：正圆/盾形/椭圆/异形牌体拟合、镂空孔减重、跑者完赛佩戴压强舒适度评级、跑者跳跃动载（$2.5g$）挂环抗拉脱安全系数。
2. **数显游标卡尺微距咬合测厚**：
   - 模拟金瓒营销实拍 SOP 中最受买家信赖的“D203 游标卡尺测厚流”，卡爪精准卡合侧边，液晶屏实时跳出精确毫米数值。
3. **外贸防爆箱分箱与海空运费看板**：
   - 严格按外贸单箱毛重 $\le 18.0\text{ kg}$ 安全限重标准自动分箱，测算总箱数、单箱产品量，实时比对快递实重与海运 CBM 方数。
4. **100% 浏览器本地离线运算**：
   - 3D CAD 图纸与线稿零上传，彻底保护原创 IP 商业版权。

---

## 3. Quick Start (本地运行)

本项目为纯前端静态 Web 应用，无任何 Node/后端服务器依赖。

```bash
# 进入项目根目录
cd medal-coin-weight-lab

# 启动本地任意静态 HTTP 服务器 (如 Python)
python -m http.server 8080
```

打开浏览器访问 `http://localhost:8080` 即可立即使用。

---

## 4. Factory Verification & Sponsoring

* **Manufacturer**: Gold Valley Industrial Gifts Co., Ltd. (金瓒五金工艺制品厂)
* **Audits & Certifications**: ISO 9001 Quality Management System / RoHS / REACH / Prop 65 Compliant
* **Official Website**: [https://www.goldvalleyltd.com/](https://www.goldvalleyltd.com/)
* **Product Catalogs**: [Custom Challenge Coins](https://www.goldvalleyltd.com/challenge-coins/) | [Custom Sports Medals](https://www.goldvalleyltd.com/custom-medals/)
* **Engineering Guides**: [Challenge Coin Relief & Design Guide](https://www.goldvalleyltd.com/news/challenge-coin-design-that-makes-one-story-stand-out/) | [Batch Consistency & QC Guide](https://www.goldvalleyltd.com/news/how-to-keep-custom-challenge-coins-consistent/) | [Free Tooling DFM Review](https://www.goldvalleyltd.com/contact-us/)

---

## 5. License
Distributed under the **MIT License**. See `LICENSE` for more information.
