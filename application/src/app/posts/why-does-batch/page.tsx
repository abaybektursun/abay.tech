'use client'
import React from 'react'
import Script from 'next/script'

// Then add only the custom overrides after all links
const overrideStyles = `
  :root {
    --background: #ffffff;
    --foreground: #171717;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background: #0a0a0a;
      --foreground: #ededed;
    }
  }

  body {
    color: var(--foreground) !important;
    background: var(--background) !important;
    font-family: Arial, Helvetica, sans-serif !important;
    transition: opacity 0.3s ease-out !important;
  }

  .page-enter {
    opacity: 0;
  }

  .page-enter-active {
    opacity: 1;
    transition: opacity 0.3s ease-in;
  }
`


export default function BatchNormPage() {
  return (
    <>
      {/* ---------- All External CSS (same approach as your current code) ---------- */}
      <link
        rel="stylesheet"
        href="https://code.getmdl.io/1.3.0/material.cyan-teal.min.css"
      />
      {/* Remove duplicates if desired */}
      <link
        rel="stylesheet"
        href="https://abaytech.tech/blog/wp-content/uploads/2018/06/c3.e0cdc3fc.css"
      />
      <link
        rel="stylesheet"
        href="https://abaytech.tech/blog/wp-content/uploads/2018/06/style.47b9fe66.css"
      />
      <link
        rel="stylesheet"
        href="https://abaytech.tech/blog/wp-content/uploads/2018/06/bootstrap.min.02d1331c.css"
      />

      {/* ---------- External Scripts ---------- */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-MML-AM_CHTML"
        strategy="lazyOnload"
        async
      />

      {/* ---------- Page Content ---------- */}
      <h3>Introduction</h3>
      <p>
        &emsp; Batch Normalization is a simple yet extremely effective technique
        that makes learning with neural networks faster and more stable. Despite
        the common adoption, theoretical justification of BatchNorm has been
        vague and shaky. The belief propagating through the ML community is that
        BatchNorm improves optimization by reducing internal covariate shift
        (ICS). As we shall see, ICS has little to no effect on optimization. This
        blog post looks at the explanations of why BatchNorm works, mainly
        agreeing with the conclusions from:{' '}
        <a href="https://arxiv.org/pdf/1805.11604.pdf">
          How Does Batch Normalization Help Optimization? (No, It Is Not About
          Internal Covariate Shift) [1]
        </a>
        . This works joins the effort of making reproducibility and open-source a
        commonplace in ML by reproducing the results from{' '}
        <a href="https://arxiv.org/pdf/1805.11604.pdf">[1]</a> live in your
        browser (thanks to{' '}
        <a href="https://js.tensorflow.org/">TensorFlow.js</a> ). To see the
        results you will have to train the models from scratch, made as easy as
        clicking a button. Initialization of parameters is random, therefore you
        will see completely different results every time you train the models.
        Source code to the models presented here can be found in{' '}
        <a href="https://github.com/abaybektursun/why-batchNorm-works">
          this GitHub repo
        </a>
        .
      </p>

      {/* BATCH NORMALIZATION, MECHANICS */}
      <h3>Batch Normalization, Mechanics</h3>
      <p>
        Batch Normalization is applied during training on hidden layers. It is
        similar to the features scaling applied to the input data, but we do not
        divide by the range. The idea is too keep track of the outputs of layer
        activations along each dimension and then subtract the accumulated mean
        and divide by standard deviation for each batch. Interactive
        visualization below explains the process better.
      </p>

      <div>
        <canvas id="canvas" />
        <div style={{ padding: '9px' }}>
          <button id="randomizeData" className="btn btn-block btn-rand">
            Randomize the Data Points
          </button>
        </div>
        <div className="row" style={{ margin: 0 }}>
          <div className="col-sm-6" style={{ padding: '0.5rem' }}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Step 1: Subtract the mean</h5>
                <p className="card-text">
                  Calculate batch mean: `\mu_\B &larr; 1/m &Sigma;(x_i)`
                </p>
                <p className="card-text">
                  Subtract the mean: {`\hat{x}_i &larr; x_i - \mu_B`}
                </p>

                <p className="card-text">
                  Subtracting the mean will center the data around zero. Click
                  the button to demonstrate the effect.
                </p>
                <p className="card-text">
                  Make sure to randomize the data if you want to subtract the
                  mean again. Pay attention to the axes.
                </p>
                <button id="subMean" className="btn btn-default btn-block">
                  Center
                </button>
              </div>
            </div>
          </div>

          <div className="col-sm-6" style={{ padding: '0.5rem' }}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Step 2: Normalize the Variance</h5>
                <p className="card-text">
                  Calculate Variance: `\sigma_B^2 &larr; 1/m &Sigma;((x_i -
                  \mu_B)^2)`
                </p>
                <p className="card-text">
                  Subtract the mean, divide by standard deviation:
                  {`\\hat{x}_i &larr; (x_i - \\mu_B) / \\sqrt(\\sigma_B^2 + \\epsilon)`}
                </p>
                <p className="card-text">
                  Subtracting the mean and dividing by the square root of
                  variance, which is basically standard deviation, will normalize
                  the data variance. Here, `\epsilon` is a negligibly small number
                  added to avoid division by zero. Click the button, pay
                  attention to the axes.
                </p>
                <button id="normVar" className="btn btn-default btn-block">
                  Normalize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'left' }}>
        Important thing to note is that traditionally, Batch Normalization has
        learnable parameters. After the steps shown above we learn linear
        transformation: {`y_i &larr; γ * \hat{x_i} + β`} where `γ, β` are the
        learned parameters and `y_i` is the output resulting from the BatchNorm
        layer. So in case BatchNorm is actually not needed, these parameters will
        learn the identity function to undo the Batch Normalization. BatchNorm
        behaves differently during test time. We no longer calculate the mean and
        variances but instead use what we have accumulated during training time
        by using exponential moving average.
      </p>

      {/* DOES BATCH NORMALIZATION WORK? */}
      <h3 style={{ textAlign: 'left' }}>Does Batch Normalization Work?</h3>
      <p style={{ textAlign: 'left' }}>
        Before we look at the plausible reasons of why BatchNorm works let's
        convince ourselves that it actually works as well as it's believed to. We
        will train a CNN with and without BatchNorm, on low and high learning
        rates. The default CNN architectures we will be using are shown below. To
        the left is the regular convolutional neural network and to the right is
        the same network with addition of batch normalization after each
        convolution.
      </p>

      <div className="wp-caption aligncenter" style={{ textAlign: 'center' }}>
        <img
          className="wp-image-406 alignnone"
          src="https://abaytech.tech/blog/wp-content/uploads/2018/06/why_bn_works-1.png"
          alt=""
          width="502"
          height="639"
          style={{ maxWidth: '100%' }}
        />
        <p className="wp-caption-text">Architecture used in this post</p>
      </div>
      <p />
      <p style={{ textAlign: 'left' }}>
        We are going to train digit classifier using the good ol'
        <a href="https://yann.lecun.com/exdb/mnist/"> MNIST dataset</a>. Below,
        you can train these two models right in your browser, just click{' '}
        <strong>Train</strong>. <em>
          After you start training, please give it minute or less to finish
          training, otherwise the page might lag.
        </em>
      </p>

      <div className="wp-caption aligncenter" style={{ textAlign: 'center' }}>
        <button id="train0" className="btn btn-block btn-rand">
          Train
        </button>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '45%' }} id="chart_losses_0" />
          <div style={{ float: 'right', width: '45%' }} id="chart_accuracy_0" />
        </div>
        <p className="wp-caption-text">
          Evaluation of the CNN vs CNN with BatchNorm on the test set during
          training with different learning rates.
        </p>
      </div>
      <p style={{ textAlign: 'left' }}>
        Now the training is complete, hopefully you see that with both learning
        rates, BatchNorm performs better. It's not unusual for the standard CNN
        without BatchNorm to get lost and diverge with higher learning rate,
        where with BatchNorm it just trains faster.
      </p>

      {/* INTERNAL COVARIATE SHIFT */}
      <h3 style={{ textAlign: 'left' }}>Internal Covariate Shift</h3>
      <p style={{ textAlign: 'left' }}>
        According to the original BatchNorm paper{' '}
        <a href="https://arxiv.org/pdf/1502.03167.pdf">[3]</a>, the trick works
        because it remedies the Internal Covariate Shift (ICS). ICS refers to the
        change of distribution of inputs to the hidden layers as the parameters
        of the model change. Concretely, shift of the mean, variance, and change
        in distribution shape. Intuitively this explanation feels correct. Let's
        say in the beginning, activations of the first layer look gaussian
        centered at some point, but as training progresses, entire distribution
        moves to another mean and becomes skewed, potentially this confuses the
        second layer and it takes longer for it to adapt. But as{' '}
        <a href="https://arxiv.org/pdf/1805.11604.pdf">[1]</a> shows, this
        reasoning might not be correct. Their results show that ICS has little to
        do with optimization performance, and BatchNorm does not have significant
        effect on ICS.
      </p>

      {/* ERROR SURFACE */}
      <h3 style={{ textAlign: 'left' }}>Error Surface</h3>
      <p style={{ textAlign: 'left' }}>
        Even before BatchNorm was mainstream, Geoffrey Hinton showed how shifting
        and scaling the inputs can reshape the error surface. As he explained in
        his{' '}
        <a href="https://www.youtube.com/watch?v=Xjtu1L7RwVM&list=PLoRl3Ht4JOcdU872GhiYWf6jwrk_SNhz9&index=26">
          Neural Networks Course (Lecture 6.2 — A bag of tricks for mini batch
          gradient descent)
        </a>
        , centering data around zero and scaling gives each dimension similar
        curvature and makes the error surface more spherical as oppose to high
        curvature ellipse.
      </p>
      <div className="wp-caption aligncenter" style={{ textAlign: 'center' }}>
        <img
          className="wp-image-406 alignnone"
          src="https://abaytech.tech/blog/wp-content/uploads/2018/06/bn_interp.png"
          alt=""
          width="502"
          height="639"
          style={{ maxWidth: '100%' }}
        />
        <p className="wp-caption-text">
          Visualization of the Loss Surface with (top) and without (bottom)
          batch-normalization. Source:{' '}
          <a href="https://arxiv.org/pdf/1612.04010v1.pdf">[2]</a>
        </p>
      </div>
      <p />
      <p style={{ textAlign: 'left' }}>
        Empirical work done by{' '}
        <a href="https://arxiv.org/pdf/1612.04010v1.pdf">D. Jiwoong et al. [2]</a>{' '}
        (figure above) observed sharp unimodal jumps in performance with batch
        normalization, but without batch normalization they reported wide bumpy
        shapes that are not necessarily unimodal. They also discovered that
        without BatchNorm, optimization performance depends highly on the weight
        initialization. Their research suggests that BatchNorm makes network much
        less dependent on the initial state.
      </p>

      {/* FUNDAMENTAL ANALYSIS */}
      <h3 style={{ textAlign: 'left' }}>Fundamental Analysis</h3>
      <p style={{ textAlign: 'left' }}>
        Authors of{' '}
        <a href="https://arxiv.org/pdf/1805.11604.pdf">[1]</a> offer their
        fundamental analysis of BatchNorm's effect on optimization. They provide
        both empirical evidence and theoretical proof that{' '}
        <i>
          BatchNorm helps optimization by making optimization landscape smoother
        </i>{' '}
        rather than reducing ICS. As we shall see, results suggest ICS might even
        have no role in optimization process. They formalize their argument by
        showing that BatchNorm improves Lipschitzness of both the loss and the
        gradients. Function `f` is known to be `L`-Lipschitz if `||f(x_1)-f(x_2)||
        &lt;= L||x_1-x_2||`. Lipschitzness of the gradient is defined by
        `&beta;`-smoothness, and `f` is `&beta;`-smooth if the function
        gradients are `&beta;`-Lipschitz: `||&nabla; f(x_1)- &nabla; f(x_2)||
        &lt;= &beta; ||x_1-x_2||` where `x_1` and `x_2` are inputs. They as well
        show that batch norm is not the only way of normalizing the activations
        to smoothen the loss landscape. They show that their `l_1`, `l_2`,
        {`l_{max}`} normalization methods provide similar benefits, although they
        can introduce higher ICS. To see these normalization results and the
        mathematical proofs please refer to the paper. I personally believe this
        type of fundamental research is very important not only for understanding
        but also for cultivating ML research culture which builds on first
        principles.
      </p>

      <p style={{ textAlign: 'left' }}>
        We are now going to see that BatchNorm has no significant effect on ICS,
        and that ICS neither hurts or improves optimization. We will be training
        three different models: Regular CNN, CNN with BatchNorm, and CNN with
        BatchNorm injected with noise (right after BatchNorm). The noise sampled
        from a non-zero mean and non-unit variance distribution, and such noise
        introduces chaotic covariate shifts, yet the model still performs better
        than regular CNN. When ready, go ahead and smash dat train button.
      </p>

      <div className="wp-caption aligncenter" style={{ textAlign: 'center' }}>
        <button id="train1" className="btn btn-block btn-rand">
          Train
        </button>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '45%' }} id="chart_losses_1" />
          <div style={{ float: 'right', width: '45%' }} id="chart_accuracy_1" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '45%' }} id="l2meanChange_1" />
          <div style={{ float: 'right', width: '45%' }} id="l2varChange_1" />
        </div>

        <p className="wp-caption-text">
          Evaluation of the models on train set (top) and change of activation
          moments (mean &amp; variance) between successive steps (bottom)
        </p>
      </div>

      <p style={{ textAlign: 'left' }}>
        After training you should see that BatchNorm with or without noise
        performs better than regular CNN. Also, in the bottom two charts you
        should see in case of the BatchNorm with noise, moments (mean &amp;
        variance) of the activations fluctuate like crazy. So we are
        intentionally introducing ICS, yet the model still performs better. This
        supports the argument put forward by the authors.
      </p>

      <p style={{ textAlign: 'left' }}>
        We are going to train CNN vs CNN + Batch Norm for the last time to look
        at the smoothness effect that BatchNorm introduces. Left chart shows how
        loss changes between each training step, and the right chart shows
        &quot;effective&quot; `&beta;` smoothness observed while interpolating in
        the direction of the gradient. The &quot;effective&quot; `&beta;` refers
        to the fact that we can't achieve global `&beta;` smoothness due to the
        non-linearities, but we can approximate local &quot;effective&quot;
        `&beta;` smoothness. Lower and less fluctuating values indicate
        smoothness.
      </p>

      <div className="wp-caption aligncenter" style={{ textAlign: 'center' }}>
        <button id="train2" className="btn btn-block btn-rand">
          Train
        </button>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '45%' }} id="lossLand2" />
          <div style={{ float: 'right', width: '45%' }} id="betaSmooth2" />
        </div>

        <p className="wp-caption-text">
          Loss change between successive steps (left) and &quot;effective&quot;
          `&beta;`-smoothness (right)
        </p>
      </div>

      <p style={{ textAlign: 'left' }}>
        The local `&beta;`-smoothness above is computed as follows: we pick some
        range `a`, and every training step `t` we travel in that range and
        calculate `max_a || &nabla; f(x_t) - &nabla; f(x_t - a * &nabla;
        f(x_t)) || / || a * &nabla; f(x_t) ||` where `&nabla; f` is the gradient
        of the loss with respect to `x_t` - activation of convolution/BatchNorm
        layer.
      </p>

      <h4>References</h4>
      <span style={{ fontSize: '7pt' }}>
        1. How Does Batch Normalization Help Optimization? (No, It Is Not About
        Internal Covariate Shift); Tsipras, Santurkar, et. al.;{' '}
        <a href="https://arxiv.org/pdf/1805.11604.pdf">
          https://arxiv.org/pdf/1805.11604.pdf
        </a>
        ; (5 Jun, 2018)
      </span>
      <br />
      <span style={{ fontSize: '7pt' }}>
        2. An Empirical Analysis of Deep Network Loss Surfaces; Daniel Jiwoong,
        Michael Tao &amp; Kristin Branson;{' '}
        <a href="https://arxiv.org/pdf/1612.04010v1.pdf">
          https://arxiv.org/pdf/1612.04010v1.pdf
        </a>
        ; (13 Jun, 2016)
      </span>
      <br />
      <span style={{ fontSize: '7pt' }}>
        3. Batch Normalization: Accelerating Deep Network Training by Reducing
        Internal Covariate Shift; Sergey Ioffe, Christian Szegedy;{' '}
        <a href="https://arxiv.org/pdf/1502.03167.pdf">
          https://arxiv.org/pdf/1502.03167.pdf
        </a>
        ; (2 Mar, 2015)
      </span>
      <br />
      <Script
        src="https://abaytech.tech/blog/wp-content/uploads/2018/06/why-batchNorm-works.34b1c539.js"
        strategy="lazyOnload"
      />
      <style>{overrideStyles}</style>
    </>
  )
}
import "@/styles/globals.css";