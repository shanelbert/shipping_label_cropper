async function get_label_images() {
	let first_col_node = Array.from(
		document.querySelectorAll('.preview [class="col first"][data-sl-col-index="0"]')
	).filter((elm) => elm.hasChildNodes() && (elm.querySelector('[data-testid="info-receiver"] b') !== null));
	let first_col = first_col_node.map((elm) => {
		return {
			resiDOM: elm,
			senderName: elm.querySelector('[data-testid="info-sender"] b').textContent,
			recipientName: elm.querySelector('[data-testid="info-receiver"] b').textContent,
			invoiceNo: elm.querySelector('.invoice-id').textContent
		};
	});

	let second_col_node = Array.from(
		document.querySelectorAll('.preview [class="col second"][data-sl-col-index="1"]')
	).filter((elm) => elm.hasChildNodes() && (elm.querySelector('[data-testid="info-receiver"] b') !== null));
	let second_col = second_col_node.map((elm) => {
		return {
			resiDOM: elm,
			senderName: elm.querySelector('[data-testid="info-sender"] b').textContent,
			recipientName: elm.querySelector('[data-testid="info-receiver"] b').textContent,
			invoiceNo: elm.querySelector('.invoice-id').textContent
		};
	});

	let allElement = [...first_col, ...second_col];	

	for (let { resiDOM } of allElement) {
		// disable text wrapping
		let kode_pengiriman = resiDOM.querySelector('[data-sl-type="awb-code"] .font-larger.font-bold');
		if (
			(kode_pengiriman !== null)
			// && kode_pengiriman.textContent.includes('TKSC')
		) {
			kode_pengiriman.style.textWrap = 'nowrap';
		}
		let info_asuransi = resiDOM.querySelector('[data-sl-type="cod-and-insurance"] .font-smaller');
		if ((info_asuransi !== null) && (info_asuransi.textContent.toLowerCase() === 'penjual tidak perlu bayar apapun ke kurir')) {
			info_asuransi.style.textWrap = 'nowrap';
		}
		
		// menambahkan div wrapper
		let newDiv = document.createElement('div');
		while (resiDOM.hasChildNodes())
			newDiv.appendChild(resiDOM.firstChild);

		resiDOM.appendChild(newDiv);
	}

	Promise.all(
		allElement.map(async ({ resiDOM, senderName, recipientName, invoiceNo }) => {
			let url = await domtoimage.toPng(
				resiDOM.firstChild,
				option = {
					bgcolor: 'white',
					style: {
						transform: `scale(2)`,
						transformOrigin: 'top left'
					}
				}
			);

			return {
				url,
				senderName,
				recipientName,
				invoiceNo
			};
		})
	).then(async (results) => {
		for (let { url, senderName, recipientName, invoiceNo } of results) {
			const anchorElement = document.createElement('a');
			anchorElement.href = url;
			anchorElement.download = `${senderName}_${recipientName}_${invoiceNo.replaceAll('/', '-')}.png`;

			document.body.appendChild(anchorElement);
			anchorElement.click();
			document.body.removeChild(anchorElement);

			// https://stackoverflow.com/questions/53560991/automatic-file-downloads-limited-to-10-files-on-chrome-browser
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();	
				}, 200);
			});
		}
		// console.log("Images downloaded");
	}).catch(console.log);
}

get_label_images();
