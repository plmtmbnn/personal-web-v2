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
				<div className={styles.copy}>
					<div className={styles.placeholder} />
					<div className={styles.placeholder} />
					<div className={styles.placeholder} />
					<div className={styles.placeholder} />
				</div>
				<div className={styles.panel}>
					<div className={`${styles.card} ${styles.placeholder}`} />
					<div className={`${styles.card} ${styles.placeholder}`} />
				</div>
			</section>
		</main>
	);
}
