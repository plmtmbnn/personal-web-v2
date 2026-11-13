"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import HomeAnimatedBackground from "./HomeAnimatedBackground";
import styles from "./HomeView.module.css";

interface HomeProps {
	initialRunningKm: number | null;
}

export default function Home({ initialRunningKm }: HomeProps) {
	const year = new Date().getFullYear();
	const [localTime, setLocalTime] = useState("");

	useEffect(() => {
		const updateClock = () => {
			setLocalTime(
				new Intl.DateTimeFormat("en-US", {
					timeZone: "Asia/Jakarta",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false,
				}).format(new Date()),
			);
		};

		updateClock();
		const timer = window.setInterval(updateClock, 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<main id="main-content" className={styles.page}>
			<HomeAnimatedBackground />
			<section className={styles.stage} aria-labelledby="home-heading">
				<header className={styles.identity}>
					<div className={styles.portrait}>
						<Image src="/profile.jpg" alt="" width={80} height={80} priority />
					</div>
					<div>
						<p className={styles.name}>{AUTHOR.name}</p>
						<p className={styles.role}>{AUTHOR.role}, Indonesia</p>
					</div>
				</header>

				<div className={styles.hero}>
					<div className={styles.heroCopy}>
						<h1 id="home-heading">
							Engineering systems by day. Miles everywhere.
						</h1>
						<p className={styles.lede}>
							Software Engineer specializing in fintech core architecture,
							lending platforms, and data systems.
						</p>
						<div className={styles.actions}>
							<Link className={styles.primaryAction} href="/work-experience">
								View work experience
							</Link>
							<Link className={styles.secondaryAction} href="/contact">
								Contact Polma
							</Link>
						</div>
					</div>

					<div className={styles.signature} aria-hidden="true">
						<span>Build</span>
						<span>Run</span>
					</div>
				</div>

				<dl
					className={styles.stats}
					aria-label="Professional and running facts"
				>
					<div>
						<dd>{EXPERIENCE_YEAR}+</dd>
						<dt>Years building systems</dt>
					</div>
					<div>
						<dd suppressHydrationWarning>
							{initialRunningKm == null
								? "N/A"
								: initialRunningKm.toLocaleString("en-US")}
						</dd>
						<dt>Kilometres run in {year}</dt>
					</div>
					<div>
						<dd>{AUTHOR_STATS.fintechSystems}+</dd>
						<dt>Fintech systems</dt>
					</div>
				</dl>

				<footer className={styles.details}>
					<div className={styles.context}>
						<p>
							<span>Base</span>
							Indonesia
						</p>
						<p>
							<span>Jakarta time</span>
							<time>{localTime || "--:--:--"}</time>
						</p>
					</div>

					<nav className={styles.socials} aria-label="Professional profiles">
						<a
							href={SOCIAL_LINKS.github}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FaGithub aria-hidden="true" />
							GitHub
						</a>
						<a
							href={SOCIAL_LINKS.linkedin}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FaLinkedin aria-hidden="true" />
							LinkedIn
						</a>
					</nav>
				</footer>
			</section>
		</main>
	);
}
