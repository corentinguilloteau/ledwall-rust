import logo from "./logo.svg";
import "./App.css";
import { invoke } from "@tauri-apps/api/tauri";
import React, { useEffect, useRef, useState } from "react";

function App() {
	const [display, setDisplay] = useState(false);

	function startstop() {
		setDisplay(!display);
		invoke("get_image");
	}

	const canvasRef = useRef(null);

	function updateCanvasImage(imageSrc) {
		const context = canvasRef.current.getContext("2d");

		var image = new Image();
		image.src = imageSrc;

		context.drawImage(image, 0, 0);
	}

	useEffect(() => {
		async function getImage() {
			let img = await invoke("get_image");

			return img;
		}

		async function displayNewImage() {
			let img = await getImage();

			console.log(img);

			updateCanvasImage(img);
		}

		let interval = null;
		if (display) {
			displayNewImage();
			interval = setInterval(() => {
				displayNewImage();
			}, 33);
		} else if (!display) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [display]);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<button onClick={startstop}>{display ? "Stop" : "Start"}</button>
				<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
					Learn React
				</a>
			</header>
			<canvas ref={canvasRef} width="320" height="240" />
		</div>
	);
}

export default App;
