import HomeAnimatedBackground from "./HomeAnimatedBackground";
import styles from "./HomeView.module.css";

export default function HomeSkeleton() {
	return (
		<main
			className={styles.page}
			aria-busy="true"
			aria-label="Loading homepage"
		>
			<HomeAnimatedBackground />
			<section className={`${styles.stage} ${styles.skeleton}`}>
				<div className={styles.identity}>
					<div className={`${styles.portrait} ${styles.placeholder}`} />
					<div className={styles.identityPlaceholder}>
						<div className={styles.placeholder} />
						<div className={styles.placeholder} />
					</div>
				</div>

				<div className={styles.hero}>
					<div className={styles.heroCopy}>
						<div className={styles.headingPlaceholder}>
							<div className={styles.placeholder} />
							<div className={styles.placeholder} />
						</div>
						<div className={styles.copyPlaceholder}>
							<div className={styles.placeholder} />
							<div className={styles.placeholder} />
						</div>
						<div className={styles.actionPlaceholder}>
							<div className={styles.placeholder} />
							<div className={styles.placeholder} />
						</div>
					</div>
					<div
						className={`${styles.signature} ${styles.signaturePlaceholder}`}
					/>
				</div>

				<div className={styles.stats}>
					{[1, 2, 3].map((item) => (
						<div key={item} className={styles.statPlaceholder}>
							<div className={styles.placeholder} />
							<div className={styles.placeholder} />
						</div>
					))}
				</div>

				<div className={styles.details}>
					<div className={styles.detailPlaceholder}>
						<div className={styles.placeholder} />
						<div className={styles.placeholder} />
					</div>
					<div className={styles.detailPlaceholder}>
						<div className={styles.placeholder} />
						<div className={styles.placeholder} />
					</div>
				</div>
			</section>
		</main>
	);
}
