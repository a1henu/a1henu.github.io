---
layout: page
permalink: /notes/freshman/aibasis/index.html
title: AI基础笔记
---

# 01-数学基础

## 01-1 Linear Algebra

## 01-2 Regression
>[!question]
>在一组数据点中找到一个多项式函数，拟合这组数据 (Linear/Polynomial Regression)
>数据为 $\mathbb{x} = (x_1, ..., x_N)^T, \mathbb{t} = (t_1, ..., t_N)^T$
>求”最佳“参数$\mathbb{w}=(w_0, ..., w_M)^T$

令M次多项式函数$y(x, \mathbb{w}) = \sum^M_{j=0} w_j x^j$，误差函数$E(\mathbb{w})=\frac{1}{2} \sum^N_{n=1} (y(x_n, \mathbb{w})-t_n)^2$，"最佳拟合"即为使得$E(\mathbb{w})$最小的$\mathbb{w}$

>[!faq] 是不是$\mathbb{w}$越大越好呢？
>多项式次数过高会导致**过拟合**
>训练数据过少，参数过多可能会**过拟合**

- 过拟合解决方案：
	- 增加数据量
	- 权重正则化
## 01-3 Probability Theory
### CS229-Mathmatical Fundamentals
[[CS229-Probability Review]]

### 概率的定义
- 概率三要素
	- 样本空间$\Omega$
	- 事件空间$\mathcal{F} \subset 2^{\Omega}$
	- 概率测度$P:\mathcal{F} \rightarrow [0,1]$
- 联合概率：
	- $X = x_i$ 和 $Y=y_j$同时发生的概率
	- Sum Rule
		- $P(X=x_{i}) = \sum_{j=1}^{L}P(X=x_{i}, Y=y_{j})$
- 条件概率
	- 在事件$X=x_{i}$发生的情况下，事件$Y=y_{j}$发生的概率
	- Product Rule
		- $P(X=x_i, Y=y_j)=P(Y=y_j|X=x_i)P(X=x_i)$

>[!theorem] Beyes' theorem
>$$P(Y|X) = \frac{P(X|Y)P(Y)}{\sum_{Y}P(X|Y)P(Y)}$$


- PDF与CDF
	- $f_{X}(x) = \frac{\mathrm{d}F_X(x)}{\mathrm{d}x}$
	- 所以$F_{X}(k)=\int_{-\infty}^{k}F_{X}(x)\mathrm{d}x$
	- 且$P(x \le X \le x + \Delta x) = F_{X}(x + \Delta x) - F_{X}(x) = \int_{x}^{x + \Delta x}f_{X}(x)\mathrm{d}x = f_{X}(\xi) \Delta x \approx f_{X}(x) \Delta x$



# 01-Python编程基础
