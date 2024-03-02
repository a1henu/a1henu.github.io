---
layout: page
permalink: /notes/freshman/aibasis/cs229-prob.html
title: CS229-Probability Review
---

# 1-Elements of Probability

## 1.1-Defination-**Axioms of Probability**
- Sample space $\Omega$: The set of all the outcomes of a random experiment.
- Event space $\mathcal{F}$: A set whose elements $A \in \mathcal{F}$ are subsets of $\Omega$.
- Probability measure: A function $P : \mathcal{F} \rightarrow \mathbb{R}$ that satisfying the following properties:
  - **Non-negativity**: $P(A) \ge 0$, for all $A \in \mathcal{F}$.
  - **Completeness**: $P(\Omega)=1$.
  - Countable Additivity: if $A_{1}, A_{2}, \cdots$ are **disjoint events** (i.e. $A_{i} \cap A_{j} = \emptyset$ whenever $i \ne j$), then $$P(\bigcup_{i=1}^{\infty} A_{i})= \sum_{i=1}^{\infty}P(A_{i})$$
## 1.2-Properties of probability
- If $A \subseteq B$, then $P(A) \le P(B)$.
- $P(A \cap B) \le min(P(A), P(B))$.
- $P(\complement_{\Omega}A) \coloneqq P(\Omega \setminus A) = 1 - P(A)$.
- $P(A\cup B) \le P(A)+P(B)$.
- If $A_{1}, \cdots, A_{k}$ are a set of **disjoint events** such that $\bigcup^{k}_{i=1}A_{i}= \Omega$, then $\sum_{i=1}^{k}P(A_k)=1$(Easy to prove by Countable Additivity).

## 1.3-Conditional probability, independence and Beyes' theorem
- The conditional probability of any event A given B is defined as $$P(A|B)\coloneqq \frac{P(A\cap B)}{P(B)} $$
- Mutually independent: $$P(\bigcap_{i \in S} A_i)=\prod_{i \in S}P(A_{i}) , \forall S \subseteq \{1, 2, \cdots, k\}$$
>[!theorem] Law of total probability
>Suppose $A_{i}, \cdots, A_{n}$ are disjoint events, and event $B$ satisfies $B \subseteq \bigcup^{n}_{i=1}A_i$, then $$P(B)=\sum_{i=1}^{n}P(A_i)P(B|A_i)$$

And an important corollary of the law of total probability is Beyes' theorem

>[!theorem] Beyes' theorem
>Suppose $A_{1}, \cdots, A_{n}$ are disjoint events, and event $B$ satisfies $B \subset \bigcup_{i=1}^{n}A_i$. Then if $P(B)>0$, it is the case that $$P(A_j|B)=\frac{P(A_j)P(B|A_j)}{\sum_{i=1}^{n}P(A_i)P(B|A_{i})}$$

Proof. 
By the fact that $$P(A_{j}\cap B) = P(A_{j})P(B|A_{j})=P(B)P(A_{j}|B)$$
Then, $$P(A_j|B)=\frac{P(A_j)P(B|A_j)}{P(B)}$$
Because of the law of total probability, the Beyes' theorem is proved.


# 2-Random Variables
## 2.1-Definition
- A random variable $X$ is a function $X : \Omega \rightarrow \mathbb{R}$.
- If $X(\omega)$ can take only a finite number of values, it is known as a **discrete random variable**.
- The probability of the set associated with a random variable $X$ taking on some specific value $k$ is$$P(X=k)\coloneqq P( \{ \omega : X(\omega) = k \})$$
- If $X(\omega)$ takes on a infinite number of possible values, it is called a **continuous random variable**.
- The probability that $X$ takes on a value between two real constants is denoted as $$P(a \le X \le b) \coloneqq P(\{\omega : a \le X(\omega) \le b\})$$
## 2.2-Cumulative distribution functions
A **cumulative distribution function** (CDF) is a function $F_{X} : \mathbb{R} \rightarrow [0,1]$ which specifies a probability measure as $$F_{X}(x) \coloneqq P(X \le x)$$
A CDF function satisfies the following properties.
- $0 \le F_{X}(x) \le 1$
- $\lim_{x \rightarrow -\infty}F_{X}(x) = 0$
- $\lim_{x \rightarrow \infty}F_{X}(x) = 1$
- $x\le y \rightarrow F_{X}(x)\le F_{X}(y)$

## 2.3-Probability mass functions
A **probability mass function** (PMF) is a function $p_{X}:\Omega \rightarrow \mathbb{R}$ such that$$p_{X}(x):=P(X=x)$$
**Notation.**
$Val(X)$ represents the set of possible values that the random variable X may assume.

A PMF function satisfies the following properties.
- $0 \le p_{X}(x) \le 1$
- $\sum_{x \in Val(X)}p_{X}(x)=1$
- $\sum_{x \in A}p_{X}(x)=P(X \in A)$

## 2.4-Probability density functions
>[!important]
>The cumulative distribution function $F_{X}(x)$ is differentiable everywhere for some continuous random variables

A **Probability Density Function** (PDF) is defined by $$f_{X}(x):= \frac{\mathrm{d}F}{\mathrm{d}x
}$$
So, $P(x \le X \le x + \Delta x) = \Delta F = f_{X}(x) \Delta x + o (\Delta x)\approx f_{X}(x) \Delta x$

A PDF function satisfies the following properties.
- $f_{X}(x) \ge 0$
- $\int_{-\infty}^{\infty}f_{X}(x)\mathrm{d}x=1$
- $\int_{x \in A}f_{X}(x)\mathrm{d}x=P(X \in A)$

## 2.5-Expectation
If $X$ is a discrete random variable with PMF $p_{X}(x)$ and $g: \mathbb{R} \rightarrow \mathbb{R}$ is an arbitary function.
In this case, $g(X)$ can be considered a random variable, and we define the **expectation** or **expected value** of $g(X)$ as $$E[g(X)]:=\sum_{x \in Val(X)}g(x) p_{X}(x)$$
if $X$ is a continuous random variable with PDF $f_{X}(x)$, then the expected value of $g(X)$ is defined as $$E[g(X)]:=\int_{-\infty}^{\infty}g(x)f_{X}(x)\mathrm{d}x$$
The **mean** of the random variable X is$$E[X]=\int_{-\infty}^{\infty}xf_{X}(x)\mathrm{d}x$$
Expectation satisfies the following properties.
- $E[a]=a$ for any constant $a \in \mathbb{R}$
- $E[af(X)]aE[f(X)]$ for any constant $a \in \mathbb{R}$
- $E[f(X)+g(X)]=E[f(X)]+E[g(X)]$. This property is known as the **linearity of expectation**
- For a discrete random variable $X$, $E[1\{X=k\}]=P(X=k)$

## 2.6-Variance
The variance of a random variable $X$ is a measure of how concentrated the distribution of a random variable $X$ is around its mean. Formally, the **variance** of a random variable $X$ is defined as $$Var[X]:=E[(X-E[X])^2]$$
And then, we can calculate
$$\begin{align*}
E[(X-E[X])^{2}] &= E[X^2-2E[X]X+E[X]^{2}]\\
&= E[X^{2}]-2E[X]E[X]+E[X]^{2}\\
&= E[X^2]-E[X]^{2}
\end{align*}$$
Variance satisfies the following properties.
- $Var[a]=0$ for any constant $a \in \mathbb{R}$
- $Var[af(X)]=a^{2}Var[f(X)]$ for any constant $a \in \mathbb{R}$

## 2.7-Some common distributions
### Discrete random variables
- $X \sim Bernoulli(p)$ (where $0 \le p \le 1$): one if a coin with heads probability $p$ comes up heads, zero otherwise. $$
p(x) = \begin{cases}p & \text{if } x=1
\\1-p & \text{if }x=0
\end{cases}
$$
- $X \sim Binomial(n,p)$ (where $0 \le p \le 1$): the number of heads in $n$ independent flips of a coin with heads probability $p$. $$p(x)=\binom{n}{x}p^{x}(1-p)^{n-x}$$
- $X \sim Geometric(p)$ (where $p > 0$): the number of flips of a coin with heads probability $p$ until the first heads. $$p(x)=p(1-p)^{x-1}$$
- $X \sim Poisson(\lambda)$ (where $\lambda > 0$): a probability distribution over the nonnegative integers used for modeling the frequency of rare events. $$p(x)=e^{-\lambda}\frac{\lambda^x}{x!}$$
### Continuous random variables
- $X \sim Uniform(a, b)$ (where $a < b$): equal probability density to every value between $a$ and $b$ on the real line. $$f(x) = \begin{cases} \frac{1}{b-a} & \text{if }a\le x \le b \\ 0 & \text{otherwise} \end{cases}$$
- $X \sim Exponential(\lambda)$ (where $\lambda > 0$): decaying probability density over the nonnegative reals. $$f(x)=\begin{cases} \lambda e^{-\lambda x} & \text{if }x\ge0 \\ 0 & \text{otherwise}
 \end{cases}$$
- $X \sim Normal(\mu, \sigma^{2})$: also known as the Gaussian distribution. $$f(x)=\frac{1}{\sqrt{2\pi }\sigma}e^{-\frac{1}{2\sigma^{2}}(x-\mu)^{2}}$$

| $DIstribution$              | $Mean$              | $Variance$              |
| :-------------------------: | :-----------------: | :---------------------: |
| $Bernoulli(p)$              | $p$                 | $p(1-p)$                |
| $Binomial(n,p)$             | $np$                | $np(1-p)$               |
| $Geometric(p)$              | $\frac{1}{p}$       | $\frac{1-p}{p^{2}}$     |
| $Poisson(\lambda)$          | $\lambda$           | $\lambda$               |
| $Uniform(a, b)$             | $\frac{a+b}{2}$     | $\frac{(b-a)^2}{12}$    |
| $Gaussian(\mu, \sigma^{2})$ | $\mu$               | $\sigma^2$              |
| $Exponential(\lambda)$      | $\frac{1}{\lambda}$ | $\frac{1}{\lambda^{2}}$ |

# 3-Two Random Variables
## 3.1-Joint and marginal distributions
A **joint cumulative distribution function** of $X$ and $Y$ is defined by$$F_{XY}(x, y) := P(X \le x, Y \le y)$$The joint CDF $F_{XY}(x, y)$ and the joint distribution functions $F_{X}(x)$ and $F_{Y}(y)$ of each variable separately are related by $$\begin{align*}
F_{X}(x) = \lim_{y \rightarrow \infty}F_{XY}(x, y) \\F_{Y}(y) = \lim_{x \rightarrow \infty}F_{XY}(x, y)
\end{align*}$$
Here, we call $F_{X}(x)$ and $F_{Y}(y)$ the **marginal cumulative distribution functions** of $F_{XY}(x, y)$.

The joint CDF satisfies the following properties.
- $0 \le F_{XY}(x, y) \le 1$
- $\lim_{x, y \rightarrow \infty}F_{XY}(x, y)$
- $\lim_{x, y \rightarrow -\infty}F_{XY}(x, y) = 0$
- $F_{X}(x) = \lim_{y \rightarrow \infty}F_{XY}(x, y)$
## 3.2-Joint and marginal probability mass functions
Let $X$ and $Y$ be discrete random variables, then the **joint probability mass function** $p_{XY} : \mathbb{R} \times \mathbb{R} \rightarrow [0, 1]$ is defined by $$p_{XY}(x, y):=P(X=x, Y=y)$$
Then the **marginal probability mass function** is defined by $$\begin{align*}
p_{X}(x)&= \sum_{y}p_{XY}(x, y)\\
p_{Y}(y)&= \sum_{x}p_{XY}(x, y)
\end{align*}$$
## 3.3-Joint and marginal probability density functions
Let $X$ and $Y$ be two continuous random variables with joint distribution function $F_{XY}(x, y)$, the **joint probability density function** is defined by $$f_{XY}(x, y) := \frac{\partial^{2} F_{XY}(x, y)}{\partial x \partial y}$$
And we can calculate$$\iint_{A} f_{XY}(x, y)\mathrm{d}x \mathrm{d}y=P((X, Y)\in A)$$
Note that the probability density function satisfies that $$\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}f_{XY}(x, y) \mathrm{d}x \mathrm{d}y = 1$$$
And we can define $$f_{X}(x)= \int_{-\infty}^{\infty}f_{XY}(x, y) \mathrm{d}y$$ as the **marginal probability density function** (or **marginal density**) of $X$

## 3.4-Conditional distributions
In the discrete case, the **conditional probability mass function** of $Y$ given $X$ is $$p_{Y|X}(y|x):= \frac{p_{XY}(x, y)}{p_{X}(x)}$$
And we define the **conditional probability density** of $Y$ given $X=x$ to be$$f_{Y|X}(y|x)=\frac{f_{XY}(x, y)}{f_{X}(x)},$$provided $f_{X}(x)\neq 0$
>[!theorem]
>Let $X$, $Y$ be two random variables defined on the same probability space, then $$E[X]=E[E[X|Y]]$$

## 3.5-Beyes' rule for random variables
In the case of discrete random variables $X$ and $Y$, $$p_{Y|X}(y|x)=\frac{p_{XY}(x, y)}{p_{X}(x)}=\frac{p_{X|Y}(x|y)p_{Y}(y)}{\sum_{y' \in Val(Y)}p_{X|Y}(x|y')p_{Y}(y')}$$
If the random variables $X$ and $Y$ are continuous, $$f_{Y|X}(y|x) = \frac{f_{XY}(x, y)}{f_{X}(x)} = \frac{f_{X|Y}(x|y)f_{Y}(y)}{\int_{-\infty}^{\infty}f_{X|Y}(x|y')f_{Y}(y')\mathrm{d}y'}$$

## 3.6-Independence of random variables
Two random variables $X$ and $Y$ are independent if $F_{XY}(x, y)=F_X(x)F_{Y}(y)$ for all values of $x$ and $y$. Equivalently,
- For discrete random variables, $p_{XY}(x, y) = p_{X}(x)p_{Y}(y)$ for all $x \in Val(X), y \in Val(Y)$
- For discrete random variables, $p_{Y|X}(y|x) = p_{Y}(y)$ whenever $p_{X}(x)\neq 0$ for all $y \in Val(Y)$
- For continuous srandom variables, $f_{XY}(x, y)=f_{X}(x)f_{Y}(y)$ for all $x, y \in \mathbb{R}$ 
- For continuous random variables, $f_{Y|X}(y|x)=f_{Y}(y)$ whenever$f_{X}(x)\neq 0$ for all $y \in \mathbb{R}$

>[!Lemma]
>If $X$ and $Y$ are independent then for any subsets $A, B \subseteq \mathbb{R}$, we have, $$P(X \in A, Y \in B)=P(X \in A) P(Y \in B)$$

## 3.7-Expectation and covariance
Suppose that we have two random variables $X$, $Y$ and $g:\mathbb{R}^{2} \rightarrow \mathbb{R}$ is a function of these two random variables. Then the expectation is defined as, 
- if they are discrete random variables$$E[g(X, Y)]:=\sum_{x \in Val(X)} \sum_{y \in Val(Y)}g(x, y)p_{XY}(x, y)$$
- if they are continuous random variables$$E[g(X, Y)]=\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}g(x, y)f_{XY}(x, y)\mathrm{d}x \mathrm{d}y$$
The covariance of two random variables $X$ and $Y$ is defined as$$Cov[X, Y]:=E[(X-E[X])(Y-E[Y])]$$
And we can calculate $$\begin{align*}
Cov[X, Y]&= E[(X-E[X])(Y-E[Y])]\\
&= E[XY-XE[Y]-YE[X]+E[X]E[Y]]\\
&= E[XY]-E[X]E[Y]
\end{align*}$$
When $Cov[X,Y]=0$, we say that $X$ and $Y$ are uncorrelated.
And the expectation and covariance satisfy the following properties,
- $E[f(X,Y)+g(X,Y)]=E[f(X,Y)]+E[g(X,Y)]$
- $Var[X+Y]=Var[X]+Var[Y]+2Cov[X,Y]$
- If $X$ and $Y$ are independent, $Cov[X,Y]=0$
- If $X$ and $Y$ are independent, $E[f(X)g(Y)]=E[f(X)]E[g(Y)]$

# 4-Multiple Random Variables
## 4.1-Basic properties
We can define the **joint distribution function**, the **joint probability density function**, the **marginal probability density function** and the **conditional probability density function** of $X_{1}, ..., X_{n}$, as$$
\begin{align*}
F_{X_{1}, X_{2}, ..., X_{n}}(x_{1}, x_{2}, ..., x_{n})&= P(X_{1}\le x_{1},X_{2}\le x_{2},...,X_{n}\le x_{n})\\
f_{X_{1}, X_{2}, ..., X_{n}}(x_{1}, x_{2}, ..., x_{n})&= \frac{\partial ^{n}F_{X_{1}, X_{2}, ..., X_{n}}(x_{1}, x_{2}, ..., x_{n})}{\partial x_{1} \partial x_{2}...\partial x_{n}}\\
f_{X_{1}}(x_{1})&= \int_{-\infty}^{\infty}...\int_{-\infty}^{\infty}f_{X_{1}, X_{2}, ..., X_{n}}(x_{1}, x_{2}, ..., x_{n})\mathrm{d}x_{2}...\mathrm{d}x_{n}\\
f_{X_{1}|X_{2}, ..., X_{n}}(x_{1}|x_{2}, ..., x_{n}) &= \frac{f_{X_{1}, X_{2}, ..., X_{n}}(x_{1}, x_{2}, ..., x_{n})}{f_{ X_{2}, ..., X_{n}}(x_{2}, ..., x_{n})}
\end{align*}
$$
To calculate the probability of an event $A \subseteq \mathbb{R}^n$ we have, 
$$P((x_{1}, x_{2}, \cdots, x_{n}) \in A)=\int_{(x_{1}, x_{2}, \cdots, x_{n}) \in A}f_{X_{1}, X_{2}, \cdots, X_{n}}(x_{1}, x_{2}, \cdots, x_{n})\mathrm{d}x_{1}\mathrm{d}x_{2}\cdots\mathrm{d}x_{n}$$

>[!theorem] Chain rule
>$$\begin{align*}
f(x_{1}, x_{2}, \cdots, x_{n})&= f(x_{n}|x_{1}, \cdots, x_{n-1})f(x_{1}, \cdots, x_{n-1})\\&= f(x_{n}|x_{1}, \cdots, x_{n-1}) f(x_{n-1}|x_{1}, \cdots, x_{n-2}) f(x_{1}, \cdots, x_{n-2})\\&=\ \cdots\ =f(x_1)\prod_{i=2}^{n}f(x_{i}|x_{1}, \cdots, x_{i-1})
\end{align*}$$

Particularly, we say that random variables $X_{1},\cdots, X_{n}$ are independent if
$$f(x_{1}, \cdots, x_{n})=\prod_{i=1}^{n}f(x_{i})$$

## 4.2-Random Vector, expectation and covariance
A **random vector** is a mapping $\Omega \rightarrow \mathbb{R}^{n}$ : $\mathbf{X}=\begin{pmatrix}X_{1}  & X_{2}  & \cdots & X_{n} \end{pmatrix}^T$  
### Expectation
Consider an arbitary function $g: \mathbb{R}^{n} \rightarrow \mathbb{R}$. The **expectation** of this function is defined as
$$E[g(X)] = \int_{\mathbb{R}^{n}}g(x_{1}, x_{2}, \cdots, x_{n})f_{X_{1}, X_{2}, \cdots,X_{n}}(x_{1}, x_{2}, \cdots, x_{n})\mathrm{d}x_{1}\mathrm{d}x_{2}\cdots \mathrm{d}x_{n}$$
If $g$ is a function from $\mathbb{R}^n$ to $\mathbb{R}^m$, i.e., if $g$ is $$g(x)=\begin{pmatrix}g_{1}(x) \\ g_{2}(x) \\ \vdots \\ g_{m}(x)\end{pmatrix}$$
Then, $$E[g(X)]=\begin{pmatrix}E[g_{1}(X)] \\  E[g_{2}(X)] \\  \vdots \\  E[g_{m}(X)] \end{pmatrix}$$
### Covariance
For a given random vector $X: \Omega \rightarrow \mathbb{R}^{n}$, its **covariance matrix** $\Sigma$ is the $n \times n$ square matrix whose entries are given by $\Sigma_{ij}=Cov[X_{i}, X_{j}]$.
Then, we have
$$\begin{align*}
\Sigma &= \begin{pmatrix}
Cov[X_{1}, X_{1}]  & \cdots  & Cov[X_{1}, X_{n}] \\
\vdots  & \ddots & \vdots \\
Cov[X_{n}, X_{1}]  & \cdots & Cov[X_{n}, X_{n}]
\end{pmatrix}\\
&= \begin{pmatrix} E[X_{1}^{2}] - E[X_{1}]E[X_{1}]  & \cdots  & E[X_{1}X_{n}] - E[X_{1}]E[X_{n}]\\
\vdots  & \ddots & \vdots \\
E[X_{n}X_{1}] - E[X_{n}]E[X_{1}]  & \cdots  & E[X_{n}^{2}] - E[X_{n}]E[X_{n}] \end{pmatrix}\\
&= E[XX^{T}]-E[X]E[X]^{T} = E[(X-E[X])(X-E[X])^{T}]
\end{align*}$$
>[!theorem]
>Suppose that $\Sigma$ is the covariance matrix corresponding to some random vector $X$. Then $\Sigma$ is symmetric positive semidefinite

**Proof.** For any vector $\mathcal{z} \in \mathbb{R}^{n}$, observe that 
$$\begin{align*}
\mathcal{z} \Sigma \mathcal{z} 
&= \sum_{i=1}^{n}\sum_{j=1}^{n}(\Sigma_{ij}\mathcal{z}_{i}\mathcal{z}_{j}) \\
&= \sum_{i=1}^{n}\sum_{j=1}^{n}(Cov[X_{i}, X_{j}]\cdot \mathcal{z}_{i}\mathcal{z}_{j}) \\
&= \sum_{i=1}^{n}\sum_{j=1}^{n}(E[(X_{i}-E[X_{i}])(X_{j}-E[X_{j}])]\cdot\mathcal{z}_{i}\mathcal{z}_{j}) \\
&= E\left[\sum_{i=1}^{n}\sum_{j=1}^{n}(X_{i}-E[X_{i}])(X_{j}-E[X_{j}])\cdot\mathcal{z}_{i}\mathcal{z}_{j}\right]
\end{align*}$$
Let $\mathcal{x}_{k}= X_{k}-E[X_{k}]$, Then
$$\begin{align*}
\sum_{i=1}^{n}\sum_{j=1}^{n}(X_{i}-E[X_{i}])(X_{j}-E[X_{j}])\cdot\mathcal{z}_{i}\mathcal{z}_{j} &= \sum_{i=1}^{n}\sum_{j=1}^{n}\mathcal{x}_{i}\mathcal{x}_{j}\mathcal{z}_{i}\mathcal{z}_{j}\\
&= \sum_{i=1}^{n}x_{i}z_{i}\sum_{j=1}^{n}x_{j}z_{j}\\
&= (\mathcal{x}^{T}\mathcal{z})^{2} \\
&\ge 0
\end{align*}$$
And hence the expectation must be nonnegative. We conclude that $\mathcal{z} \Sigma \mathcal{z} \ge 0$

## 4.3-The law of large numbers and Central limit theorem
>[!theorem]
>**Chebyshev inequality.** For every random variables  $X$ that has finite variance, we have $$P(|X-E[X]|\ge \epsilon) \le \frac{Var[X]}{\epsilon^{2}}$$

**Proof.** Let $F_{X}(x)$ be the cumulative distribution function of $X$, then 
$$\begin{align*}
Var[X] &= \int_{-\infty}^{\infty}(x-E[X])^{2}\mathrm{d}F_{X}(x)\\
&\ge \int\limits_{|X-E[X]|\ge \epsilon} (x-E[X])^{2}\mathrm{d}F_{X}(x)\\
&\ge \int\limits_{|X-E[X]|\ge \epsilon} \epsilon^{2}\mathrm{d}F_{X}(x)\\
&= \epsilon^{2}P(|X-E[X]|\ge \epsilon)
\end{align*}$$
So, we have $$P(|X-E[X]|\ge \epsilon) \le \frac{Var[X]}{\epsilon^{2}}$$
And equivalently, 
$$P(|X-E[X]|< \epsilon) \ge 1 - \frac{Var[X]}{\epsilon^{2}}$$

### The law of large numbers
The law of large numbers is a rule that claims the average of the results obtained from a large number of trials should converge to its expected value.
So we have the **Strong Law of Large Numbers**
>[!theorem]
>Let $X_{1}, X_{2}, \cdots$, be a series of independent and identically distributed (i.i.d.) random variables for which $E[X_{1}] < \infty$. Then
>$$P\left(\lim_{n \rightarrow \infty} \frac{1}{n} \sum_{i=1}^{n} X_{i} = E[X_{1}]\right)=1$$

### The central limit theorem
>[!theorem]
>Let $X_{1}, X_{2}, \cdots$, be a series of iid random variables with mean $\mu$ and variance $\sigma^{2}$. Then the normalized partial sum
>$$\xi_{n}:=\frac{1}{\sqrt{n}} \sum_{i=1}^{n}\left(\frac{X_{i}-\mu}{\sigma}\right)$$
>satisfies $$\lim_{n \rightarrow \infty}P(\xi_{n} \le x)=\Phi(x) $$
>for any $x$, where $\Phi$ is CDF of the standard normal distribution.



