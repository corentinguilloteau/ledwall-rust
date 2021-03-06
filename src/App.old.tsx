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

	const canvasRef = useRef<HTMLCanvasElement>(null);

	function updateCanvasImage(imageSrc: string) {
		if (canvasRef.current !== null) {
			const context = canvasRef.current.getContext("2d");

			if (context === null) return;

			var image = new Image();
			image.src = imageSrc;

			context.drawImage(image, 0, 0);
		}
	}

	useEffect(() => {
		async function getImage(): Promise<string> {
			let img: string = await invoke("get_image");

			return img;
		}

		async function displayNewImage() {
			let img: string = await getImage();

			updateCanvasImage(img);
		}

		let interval: ReturnType<typeof setTimeout> | undefined;
		if (display) {
			displayNewImage();
			interval = setInterval(() => {
				displayNewImage();
			}, 16);
		} else if (!display) {
			if (typeof interval !== "undefined") clearInterval(interval);
		}
		return () => {
			if (typeof interval !== "undefined") clearInterval(interval);
		};
	}, [display]);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p></p>
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
