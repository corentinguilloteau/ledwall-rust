<div id="top"></div>
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/corentinguilloteau/ledwall-rust?display_name=tag&include_prereleases)

<h3 align="center">TSM Ledwall Controler</h3>

  <p align="center">
    A Rust based software to control TSM's LED wall
    <br />
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#usage">Installation and usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

TSM's LED wall is a PACT project made at Telecom Paris. At the beginning, it was controled from a computer using a CLI
written in C++. The problem was that it is not really enjoyable to use a CLI for this kind of application, but also that
the knowledge of the software was getting lost from year to year.

Thus, my aim here is to:

-   Provide a nice UI to improve the UX and facilitate manipulation in the rush of an event
-   Provide a integrated detailed guide on how to use the ledwall
-   Provide a better and more customizable integration of Spout, by allowing the user to connect to multiple Spout
    senders

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

-   [Tauri](https://tauri.studio/)
-   [React.js](https://reactjs.org/)
-   [Mantine](https://mantine.dev/)
-   [Spout](https://github.com/leadedge/Spout2)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally. To get a local copy up and
running follow these simple example steps.

## Installation and usage

Install this project using the `.msi` file from the latest release. It is then ready to be used. The usage instructions
are embedded in the software, in the **Guide** tab.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

-   [ ] Add detection of incompatible slice configurations
-   [ ] Plug real informations into badges
-   [ ] Add the console feedback
-   [ ] Add the guide
