"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import HomeAnimatedBackground from "./HomeAnimatedBackground";
import styles from "./HomeView.module.css";

interface HomeProps {
	initialRunningKm: number | null;
}

export default function Home({ initialRunningKm }: HomeProps) {
	const year = new Date().getFullYear();
	return (
		<main id="main-content" className={styles.page}>
			<HomeAnimatedBackground />
			<section className={styles.stage} aria-labelledby="home-heading">
				<div className={styles.copy}>
					<div className={styles.identity}>
						<div className={styles.portrait}>
							<Image
								src="/profile.jpg"
								alt=""
								width={80}
								height={80}
								priority
							/>
						</div>
						<div>
							<p className={styles.name}>{AUTHOR.name}</p>
							<p className={styles.role}>{AUTHOR.role}, Indonesia</p>
						</div>
					</div>

					<h1 id="home-heading">
						Engineering systems by day. Miles everywhere.
					</h1>
					<p className={styles.lede}>
						Software Engineer building fintech core architecture, lending
						platforms, and data systems.
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

				<div className={styles.panel}>
					<dl
						className={`${styles.card} ${styles.stats}`}
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

					<div className={`${styles.card} ${styles.channels}`}>
						<nav className={styles.socials} aria-label="Professional profiles">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
							>
								<FaGithub aria-hidden="true" />
								GitHub
								<FiArrowUpRight aria-hidden="true" />
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
							>
								<FaLinkedin aria-hidden="true" />
								LinkedIn
								<FiArrowUpRight aria-hidden="true" />
							</a>
						</nav>
					</div>
				</div>
			</section>
		</main>
	);
}
