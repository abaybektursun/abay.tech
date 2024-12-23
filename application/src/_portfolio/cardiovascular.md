---
title: "Building a Medical-Grade Heart Monitor with an iPhone Camera"
excerpt: "Lessons from the Trenches"
date: "2024-05-05"
video: "eulerian.mp4"
---

Playa Del Carmen, Mexico. Excited, I am walking along the gorgeous beach and Quinta Avenida   back to my Airbnb with a newly purchased blood pressure (BP) cuff. We just deployed the first version of cuff-less heart monitor model on my client’s iPhone app, and when I get to my place, I put on the BP monitor on my arm, and face my iPhone camera. I look at the monitor and then at the app on my phone. Satisfaction and joy: BP and HR values match perfectly! 

The app measures heart vitals, specifically PPG, BP, and HR using nothing but iPhone selfie camera.
When I had started working on the project, things were not going so well. Client was stuck. They have spent the past few months building the app and the model, however they were nowhere near even the MVP. I have assessed the situation:

- Team was stuck optimizing and fixing rather than iterating and validating.
- There was no effective communication and therefore scattered focus.
- There was no clear technical path forward for the team to follow.

By the end of my engagement my client had:

- Working app and production grade models.
- Strong MLOps: Standardized evaluation metrics and datasets, cloud model training infrastructure, detailed W&B experiment tracking workspace.
- Surveys of the most of the relevant research.
- Technical vision and systematic way for the developers to work together effectively.

In this post, I am not going to share the info under NDA, or boring project details, I’ll just share the lessons and realizations I found valuable working on this project.

## ML Development Approach

### Fast iteration beats perfect implementation

Especially in building ML products. There are countless research ideas and models clamming to achieve SOTA, however only small fraction of them actually even work. It’s crucial to try things fast and validate them without any attachments. I like the method my University Calculus teacher taught me: “if you are stuck on a problem for over 15 minutes, just go onto another one, and if you need to, you can come back to the old problem with a fresh perspective”. Rapid prototyping is the skill I have developed quite well, and enjoy in my work the most, it allowed us to find the methods that work the best for the client. It also helped the keep team energized thanks to the diversity of work and interesting results.

### Developers need to be able to test their work end-to-end

I noticed that ML team was testing the models in isolation, without deploying the models to the iOS, when they did, they had to do a meeting with iOS team in a different time zone, the whole arrangement was slow and frustrating. I worked with the iOS team to build a quick local Xcode setup for everyone. This also helped us identify some bugs that were missed by iOS team.
Of course after going to prod with real clients there needs to be an end-to-end CI/CD with something like [**Xcode Cloud**](https://developer.apple.com/documentation/Xcode/About-Continuous-Integration-and-Delivery-with-Xcode-Cloud), however, in the development stages it is important that everyone can test their work in the final product without any red tape.

### Radical Transparency

As I get older I am realizing more and more the value of [Ray Dalio’s Trust in Radical Truth and Radical Transparency](https://www.principles.com/principles/f6412dca-b3f9-4dd0-bb65-274869dd21ed). However, one thing I realized is that transparency is a side effect of changing my relationship with the individual members of the team. When I suspend any judgement, and open my heart to the people, openness and honesty is often reciprocated, and more than that, it’s spread. With transparency, information flows smooth among the team members, and everyone gains the power of effective decision making. Be patient with it, it will take at least 2 months for the team (5-6 people) dynamics to change.

## Deploying models to iPhone

These are some technical lessons that are specific to developing ML product for iOS or mobile in general.

### Try to move as much image processing to the model as possible.

This is essential for separation of concerns. One thing I noticed is that iOS team did not have computer vision (CV) or image processing skills, which created some issues that were hard to debug. For example:

**Alpha channel assumption**

```swift
for y in 0..<min(max, height) {
    var row: [[UInt8]] = [[UInt8]]()
    for x in 0..<min(max, width) {
        let i = bytesPerRow * y + x * 4
        let r = ptr[i]
        let g = ptr[i + 1]
        let b = ptr[i + 2]
...
```

OpenCV decodes video files without alpha channel, however the iOS code missed that, creating a very tricky bug to resolve.

![What model saw with the bug](https://abay.tech/alpha_bug.jpg)

[**The dumb reason your fancy Computer Vision app isn’t working: Exif Orientation**](https://medium.com/@ageitgey/the-dumb-reason-your-fancy-computer-vision-app-isnt-working-exif-orientation-73166c7d39da)

When there is an issue with a CV model on mobile, this is the first cause I thing for, and more often than not, it is the cause. The camera sensor reads pixels in sequential lines and saves the raw data in fixed landscape orientation. When developer reads it (`cv2.imread()` for example), the orientation is wrong. It's more efficient to just add a small metadata tag saying "rotate this" than to actually rearrange millions of pixels. 

![image.png](https://abay.tech/landscape_bug.jpg)

**How to move the image processing to the model?**

Take advantage of CoreML and Metal infrastructure! Specifically, [use latest CoreML](https://coremltools.readme.io/v6.3/docs/pytorch-conversion), convert your models to `.mlpackage` rather than `.mlmodel` because that will allow you to convert wider range of operations like image pre-processing. It will also speed up your inference over using PyTorch on device.

One issue that you might encounter is missing operation (OP) in CoreML. However, this can be overcome without too much difficulty thanks to code generation abilities of Claude and ChatGPT. You just need to: 

1. Get the description of the OP
2. Tell the AI to generate code of Metal Shared in C++
3. And then register the OP with PyTorch

### Philosophy Corner

Since this project was heavy in signal processing, it made me ponder a lot about the fundamental nature of the signal. In ML and AI we use neural networks to compress the data into model parameters. There are some structural priors we utilize like convolution, attention, hierarchy of features, etc. What I realized most of signal processing is about data compression with structural prior: non periodic signal can be decomposed into periodic signals. This explains the motivation behind research like Wavelet neural networks. It also made me realize something: The universe has a deep mathematical structure consisting of oscillations and waves, and complex phenomena can be understood as combinations of simple oscillations. This gave me goose bumps, since in my Buddhist and Hindu spiritual practice we often experience the reality as different levels of vibrations. 

---

Want to discuss building production ML systems? [Let’s chat](https://calendar.app.google/MNjtZnQ85BDBKm1b8).