export async function getLabels(pdfBuffer) {
	await import('./packages/pdf.mjs');
	pdfjsLib.GlobalWorkerOptions.workerSrc = "./packages/pdf.worker.mjs";
	
	let pdf = await pdfjsLib.getDocument(pdfBuffer).promise.catch(console.error);
	// console.log('PDF loaded');

	// download label
	function getBottomLeftText(texts) {
		// mendapatkan teks yang terletak di paling kiri bawah

		let elementMinX = [texts[0]];
		let valueMinX = texts[0].transformDetail.translateX;
		for (let t of texts.slice(1)) {
			if (t.transformDetail.translateX < valueMinX) {
				elementMinX = [t];
				valueMinX = t.transformDetail.translateX;
			} else if (t.transformDetail.translateX === valueMinX) {
				elementMinX.push(t);
			}
		}
		// di antara semua elemen yang koordinat X-nya minimum,
		// dapatkan 1 elemen yang koordinat Y-nya minimum
		let elementMinXMinY = elementMinX[0];
		let valueMinY = elementMinX[0].transformDetail.translateY;
		for (let t of elementMinX.slice(1)) {
			if (t.transformDetail.translateY <= valueMinY) {
				elementMinXMinY = t;
				valueMinY = t.transformDetail.translateY;
			}
		}
		return elementMinXMinY;
	}

	function getBottomRightText(texts) {
		// mendapatkan teks yang terletak di paling kanan bawah

		let elementMaxX = [texts[0]];
		let valueMaxX = texts[0].transformDetail.translateX;
		for (let t of texts.slice(1)) {
			if (t.transformDetail.translateX > valueMaxX) {
				elementMaxX = [t];
				valueMaxX = t.transformDetail.translateX;
			} else if (t.transformDetail.translateX === valueMaxX) {
				elementMaxX.push(t);
			}
		}
		// di antara semua elemen yang koordinat X-nya maksimum,
		// dapatkan 1 elemen yang koordinat Y-nya minimum
		let elementMaxXMinY = elementMaxX[0];
		let valueMinY = elementMaxX[0].transformDetail.translateX;
		for (let t of elementMaxX.slice(1)) {
			if (t.transformDetail.translateY <= valueMinY) {
				elementMaxXMinY = t;
				valueMinY = t.transformDetail.translateY;
			}
		}
		return elementMaxXMinY;
	}

	function getCustomDimensions(texts) {
		// ukuran default: shopee express standard
		let customDim = {
			marginLeft: 2, // jarak dari sisi kiri resi ke luar
			marginRight: 26, // jarak dari sisi kanan resi ke luar
			marginBottom: 3, // jarak dari sisi bawah resi ke luar 
			marginFromTop: 10, // jarak dari sisi atas halaman ke sisi atas resi (semakin besar, hasil resi akan semakin pendek)
		};
		let noResi = null;
		let type = null;
		let knownType = [
			'STD', // SPX
			'ECO', // SPX, J&T
			'INSTANT', // SPX
			'Reguler' // JNE
		];
		for (let t of texts) {
			if (knownType.includes(t.str.trim())) {
				type = t.str.trim();
			}

			if (t.str.includes('No. Resi')) {
				noResi = t.str.replace('No. Resi', '').replace(':', '').trim();
			}
		}

		if ((noResi === null) && (type === 'INSTANT')) {
			console.log('spx instant');
			// SPX INSTANT
			customDim = {
				marginLeft: 2,
				marginRight: 21,
				marginBottom: 3,
				marginFromTop: 10,
			};
		} else if (noResi?.includes('JP')) {
			// J&T
			customDim = {
				marginLeft: 2,
				marginRight: 35,
				marginBottom: 3,
				marginFromTop: 10,
			};
		} else if (noResi?.includes('CM')) {
			// JNE
			customDim = {
				marginLeft: 2,
				marginRight: 35,
				marginBottom: 3,
				marginFromTop: 2,
			};
		} else if (noResi?.length === 0) {
			// SPX ECO
			customDim = {
				marginLeft: 2,
				marginRight: 23,
				marginBottom: 3,
				marginFromTop: 10,
			};
		}
		return customDim;
	}
	
	function getResiIdentifier(texts) {
		const placeholder = 'Resi';

		let noResi;
		let targetPosition;
		for (let t of texts) {
			if (t.str.includes('No. Resi')) {
				noResi = t.str.replace('No. Resi', '').replace(':', '').trim();

				if (noResi.length > 0) {
					return noResi;
				}

				// handle kasus no resi dan value no resi yang beda baris sehingga beda object text
				// (shopee express standard)

				// koordinat middle center teks no resi dengan 
				// y yang dikurangi sebanyak 1 kali tinggi teks no resi
				targetPosition = {
					x: t.transformDetail.translateX + 0.5 * t.width,
					y: t.transformDetail.translateY - 1.5 * t.height
				}
				break;
			}
		}

		// handle kasus tidak ada nomor resi (shopee express instant)
		if (!targetPosition) {
			for (let t of texts) {
				if (t.str.includes('No. Pesanan')) {
					return t.str.replace('No. Pesanan', '').replace(':', '').trim();
				}
			}
			// jika nomor pesanan juga tidak ditemukan, fallback ke nama dummy
			return placeholder;
		}

		let itemStartX;
		let itemEndX;
		let itemStartY;
		let itemEndY;
		for (let t of texts) {
			itemStartX = t.transformDetail.translateX;
			itemEndX = itemStartX + t.width;
			itemStartY = t.transformDetail.translateY - t.height;
			itemEndY = t.transformDetail.translateY;

			if (
				(targetPosition.x >= itemStartX) && (targetPosition.x <= itemEndX)
				&& (targetPosition.y >= itemStartY) && (targetPosition.y <= itemEndY)
			) {
				return t.str;
			}
		}
		// jika value nomor resi tidak ditemukan, fallback ke nama dummy
		return placeholder;
	}
	
	// function getResiIdentifier(texts) {
	// 	// jika ada no resi (meskipun ada no pesanan), gunakan no resi
	// 	// jika tidak ada, gunakan no pesanan
	// 	// jika tidak ada, gunakan string 'Resi'
	// 	let no_pesanan = null;
	// 	for (let t of texts) {
	// 		if (t.str.includes('No. Resi')) {
	// 			// handle kasus no resi dan value no resi yang beda baris sehingga beda object text
	// 			let nr = t.str.replace('No. Resi', '').replace(':', '').trim();
	// 			if (nr.length > 0) {
	// 				return nr;
	// 			}
	// 		}
	// 		if (t.str.includes('No. Pesanan')) {
	// 			no_pesanan = t.str.replace('No. Pesanan', '').replace(':', '').trim();
	// 		}
	// 	}
	// 	return no_pesanan !== null ? no_pesanan : 'Resi';
	// }

	const viewportScale = 1.5;
	const outputScale = window.devicePixelRatio || 1;
	const multiplier = viewportScale * outputScale;

	async function downloadLabel(pageNo) {
		let page = await pdf.getPage(pageNo).catch(console.error);
		// console.log(`Page ${pageNo} loaded`);

		let viewport = page.getViewport({ scale: viewportScale });

		// render original pdf into canvas
		let originalCanvas = document.createElement('canvas');
		let originalCanvasContext = originalCanvas.getContext('2d');

		originalCanvas.width = Math.floor(viewport.width * outputScale);
		originalCanvas.height = Math.floor(viewport.height * outputScale);
		originalCanvas.style.width = Math.floor(viewport.width) + "px";
		originalCanvas.style.height = Math.floor(viewport.height) + "px";

		let transform = outputScale !== 1
			? [outputScale, 0, 0, outputScale, 0, 0]
			: null;

		let renderContext = {
			canvasContext: originalCanvasContext,
			transform: transform,
			viewport: viewport,
			intent: "print" // mencegah page.render() di-pause pada window.requestAnimationFrame(). 
			// https://github.com/mozilla/pdf.js/issues/6460#issuecomment-1018818522
		};

		await page.render(renderContext).promise;

		// create cropped canvas
		let content = await page.getTextContent().catch(console.error);
		let texts = content.items.filter((item) => item.str.trim().length > 0).map((item) => {
			return {
				width: item.width,
				height: item.height,
				str: item.str,
				transformDetail: {
					// scaleX: item.transform[0],
					// skewY: item.transform[1],
					// skewX: item.transform[2],
					// scaleY: item.transform[3],
					translateX: item.transform[4],
					translateY: item.transform[5],
				}
			}
		});

		let originalViewPort = page.getViewport({ scale: 1 });

		let leftHalfTexts = texts.filter(
			(t) => t.transformDetail.translateX < originalViewPort.width / 2
		);
		let pair_1 = {
			bottomLeftText: getBottomLeftText(leftHalfTexts),
			bottomRightText: getBottomRightText(leftHalfTexts),
			customDim: getCustomDimensions(leftHalfTexts),
			resiNo: getResiIdentifier(leftHalfTexts)
		};


		let rightHalfTexts = texts.filter(
			(t) => t.transformDetail.translateX > originalViewPort.width / 2
		);
		let pair_2 = rightHalfTexts.length > 0 ? {
			bottomLeftText: getBottomLeftText(rightHalfTexts),
			bottomRightText: getBottomRightText(rightHalfTexts),
			customDim: getCustomDimensions(rightHalfTexts),
			resiNo: getResiIdentifier(rightHalfTexts)
		} : null;


		for (let currentPair of [pair_1, pair_2]) {
			if (currentPair === null) {
				// skip bagian kanan dari halaman yang hanya mengandung 1 resi
				continue;
			}

			let { bottomLeftText, bottomRightText, customDim, resiNo } = currentPair;

			// menggunakan sistem koordinasi canvas (x = jarak dari kiri, y = jarak dari atas).
			// sistem koordinasi pdf: x = jarak dari kiri, y = jarak dari bawah
			let coords = {
				bottomLeft: {
					x: bottomLeftText.transformDetail.translateX * multiplier - customDim.marginLeft * multiplier,
					y: viewport.height * outputScale - bottomLeftText.transformDetail.translateY * multiplier + customDim.marginBottom * multiplier
				}
			};
			coords['bottomRight'] = {
				// width tidak dipakai karena panjang konten teksnya (quantity) bisa berbeda-beda
				x: bottomRightText.transformDetail.translateX * multiplier + customDim.marginRight * multiplier,
				y: coords.bottomLeft.y
			};
			coords['topLeft'] = {
				x: coords.bottomLeft.x,
				y: customDim.marginFromTop
			};
			coords['topRight'] = {
				x: coords.bottomRight.x,
				y: coords.topLeft.y
			};

			// originalCanvasContext.strokeStyle = "red";
			// originalCanvasContext.lineWidth = 1;
			// originalCanvasContext.strokeRect(
			// 	coords.topLeft.x,
			// 	coords.topLeft.y,
			// 	coords.topRight.x - coords.topLeft.x,
			// 	coords.bottomLeft.y - coords.topLeft.y
			// );

			let cropCanvas = document.createElement('canvas');
			cropCanvas.width = Math.floor(coords.topRight.x - coords.topLeft.x);
			cropCanvas.height = Math.floor(coords.bottomLeft.y - coords.topLeft.y);
			let cropCanvasContext = cropCanvas.getContext('2d');

			cropCanvasContext.drawImage(
				originalCanvas,
				coords.topLeft.x,
				coords.topLeft.y,
				cropCanvas.width,
				cropCanvas.height,
				0,
				0,
				cropCanvas.width,
				cropCanvas.height
			);

			const anchorElement = document.createElement('a');
			anchorElement.href = cropCanvas.toDataURL();
			anchorElement.download = `${resiNo}.png`;

			document.body.appendChild(anchorElement);
			anchorElement.click();
			document.body.removeChild(anchorElement);

			// https://stackoverflow.com/questions/53560991/automatic-file-downloads-limited-to-10-files-on-chrome-browser
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 200);
			})
		}
	};

	// render page secara sekuensial
	// https://mozilla.github.io/pdf.js/examples/#:~:text=Previous/Next%20example
	for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
		await downloadLabel(pageNo);
	}
}

export async function getPdfBuffer(pdfUrl) {
	const maxRetryAttempt = 3; 
	let retryAttempt = 0;
	let response;
	while ((!response || !response.ok) && (retryAttempt < maxRetryAttempt)) {
		try {
			response = await fetch(pdfUrl, { method: 'get' });
		} catch (err) {
			// jika masih ada kesempatan attempt selanjutnya
			if (retryAttempt + 1 < maxRetryAttempt) {
				// tunggu beberapa saat sebelum melakukan attempt ulang
				await new Promise((resolve) => {
					setTimeout(() => resolve(), 3000);
				});
			}
		} finally {
			retryAttempt++;
		}
	}
	
	if (response?.ok) {
		let pdfBlob = await response.blob();
		let pdfBuffer = await pdfBlob.arrayBuffer();
		return pdfBuffer;
	} else {
		throw new Error("Fetch failed");
	}
}

export async function getPdfUrl() {
	return document.querySelector('iframe[type="application/pdf"]').getAttribute('src');
}