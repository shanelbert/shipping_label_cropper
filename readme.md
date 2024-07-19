## What is in this repo?

1. Scripts for a **browser extension** that enables you to download shipping labels from Tokopedia and Shopee as image files in PNG format.
2. A **Microsoft Word macro** script to resize and rearrange the images to create ready-to-be-printed pages.

Jump to the [usage section](#usage) to see if these tools will help you.

> These tools are intended for sellers with multiple stores on Tokopedia and Shopee. Sellers with only one store on Tokopedia might not need these tools, as the label printing feature from Tokopedia already offers the same functionality.

## Table of Contents

- [Setup](#setup)
	- [Browser Extension](#browser-extension)
	- [MS Word Macro](#ms-word-macro)
- [Usage](#usage)
- [Limitation](#limitation)
- [External Libraries](#external-libraries)

## Setup

### Browser Extension

1. Download this repo as a zip file.

<img src="https://drive.usercontent.google.com/download?id=1YmdusIlI4CxiOlHuMN1pz4fIfzJJ6oCG" width="800px">

<br>

2. Extract the zip file.

<br>

3. Open Chrome/Edge/Opera browser.

<br>

4. Open *manage extensions* page.
- In Chrome, go to <chrome://extensions>
- In Edge, go to <edge://extensions>
- In Opera, go to <opera://extensions>

<br>

5. Enable developer mode.

<img src="https://drive.usercontent.google.com/download?id=1t28FyS2rOzCDZ5a9Sw3KK1LbDfk5EAvB" width="800px">

<br>

6. Click the load unpacked button.

<img src="https://drive.usercontent.google.com/download?id=1FLq7EQfR_RtNil3QyQO-gMdyGaM2gFkI" width="800px">

<br>

7. Select the `/chromium` folder in the extracted folder from step 2.

<img src="https://drive.usercontent.google.com/download?id=112YSre8LDYpu01Iyu9GbfPqT82G4cZ1l" width="800px">

<br>

8. (Optional) Pin the extension.

<img src="https://drive.usercontent.google.com/download?id=1Zy-0Pa9Rpf760MnYddbLZkd8DOAcuPE9" width="800px">

<br>

The extension is now loaded and ready to be used!

### MS Word Macro

1. [Show the developer tab](https://support.microsoft.com/en-us/office/show-the-developer-tab-in-word-e356706f-1891-4bb8-8d72-f57a51146792#OpenDevTab=Windows).

<br>

2. In the developer tab, click the Visual Basic button.

<img src="https://drive.usercontent.google.com/download?id=1VbToOECzesGiRceB5bAbax9kzy1y7YQA" width="800px">

<br>

3. Copy the code from `/word_macro/main.txt` and paste it into the Visual Basic window.

<img src="https://drive.usercontent.google.com/download?id=1u3MFGqZ17vWjWzF02OaJ3V0RqevH6Uju" width="800px">

<br>

4. Scroll to the bottom, delete the `End If` and `End Sub`, then rewrite them.

<br>

5. Save the script, then close the Visual Basic window.

<br>

6. Add the macro to the Quick Access Toolbar.

<img src="https://drive.usercontent.google.com/download?id=1x4--AgmYPfzdrfnV1MskpN44hw3Ayhpz" width="800px">

<br>

<img src="https://drive.usercontent.google.com/download?id=1du5t9kyEmjqr6EjUaXqxf2OphQzegRCu" width="800px">

<br>

<img src="https://drive.usercontent.google.com/download?id=1cUdfLi1LGI99w7-aRiRveDvex-kGNmEv" width="800px">

<br>

<img src="https://drive.usercontent.google.com/download?id=1PUzC1UR3ebqra6afy4uvDEVmmANoV8a6" width="800px">

<br>

Now you can run the macro by clicking this icon in the Quick Access Toolbar.

<img src="https://drive.usercontent.google.com/download?id=17Dj9NKn4pml2kvntHu1gMSmq8z9fXHnX" width="800px">

<br>

7. (Optional) [Enable all macros](https://support.microsoft.com/en-us/office/enable-or-disable-macros-in-office-for-mac-c2494c99-a637-4ce6-9b82-e02cbb85cb96?ns=null&version=undefined) to turn off the warning message that shows up whenever you try to open a document that contains a macro.

## Usage

1. Open the print preview pages for the desired labels in one window.

<img src="https://drive.usercontent.google.com/download?id=1-_w7HYTsun1nfJe1ui0-VaYc0lgUqbxg" width="800px">

*Tokopedia's label preview page*

<br>

<img src="https://drive.usercontent.google.com/download?id=1XruEQ7P_zKTzzYfyTB3TJh5VHVhq_fmg" width="800px">

*Shopee's Label preview page*

<br>

2. Click the extension icon, then click the download button. All labels from the opened tabs will be downloaded.

<img src="https://drive.usercontent.google.com/download?id=1utuB0xxSQiZGgZw27ZNc5ToY58KJB_dk" width="800px">

<br>

3. Copy and paste the image files into a Word document.

<br>

4. Run the macro. The result will look like this:

<img src="https://drive.usercontent.google.com/download?id=1jv3_zAcjSSlkMvWL5KxedclJJQVnRg6g" width="800px">

The macro will ensure that there are a maximum of 6 images on each page, so the result for a document with more than 6 images will look like this:

<img src="https://drive.usercontent.google.com/download?id=1CgFNurP4ClOsvIvr1VYJomf197mD8Oaf" width="800px">

## Limitation
 
1. The browser extension is made specifically for Tokopedia and Shopee. 

2. The current browser extension scripts are intended for use in Chromium-based browsers. Development for the Firefox version has been discontinued due to unresolved font-related issues that prevent the extensions from producing readable results. The resulting image for the Firefox version resembled the one shown in this [Stack Overflow post](https://stackoverflow.com/q/49275979).

3. The crop dimensions for Shopee labels are hardcoded in `/chromium/shopee.js` due to each courier service having different shipping label content and layout. The dimensions have only been specified for JNE, J&T, Shopee Express, Grab, and Gojek. The script will use Shopee Express label dimensions for other courier services.

## External Libraries
The scripts in `/chromium/packages` are downloaded from these sources:
- [dom-to-image](https://github.com/tsayen/dom-to-image) (The dom-to-image script in this repo has been modified from the original version)
- [pdf.js](https://mozilla.github.io/pdf.js/)
- [material components](https://m2.material.io/develop/web/getting-started)
- [sanitize css](https://github.com/csstools/sanitize.css/)