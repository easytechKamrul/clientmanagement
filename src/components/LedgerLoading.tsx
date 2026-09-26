import styles from "./LedgerLoading.module.css";

type Props = { view?: "dashboard" | "ledger" };

export default function LedgerLoading({ view = "dashboard" }: Props) {
  return (
    <div className={`app-shell ${styles.shell}`} aria-busy="true">
      <span className={styles.srOnly} role="status">
        Loading {view === "dashboard" ? "dashboard" : "ledger"} data
      </span>
      <aside className={`sidebar ${styles.sidebar}`} aria-hidden="true">
        <div className={styles.brand}>
          <i className={`${styles.block} ${styles.logo}`} />
          <div className={styles.brandText}>
            <i className={`${styles.block} ${styles.brandName}`} />
            <i className={`${styles.block} ${styles.brandCaption}`} />
          </div>
        </div>
        <div className={styles.navigation}>
          <i className={`${styles.block} ${styles.navItem}`} />
          <i className={`${styles.block} ${styles.navItem}`} />
        </div>
        <div className={styles.sidebarFoot}>
          <i className={`${styles.block} ${styles.footLabel}`} />
          <i className={`${styles.block} ${styles.footValue}`} />
          <i className={`${styles.block} ${styles.footBar}`} />
        </div>
      </aside>
      <main className={`content ${styles.content}`} aria-hidden="true">
        <header className={styles.header}>
          <div className={styles.heading}>
            <i className={`${styles.block} ${styles.eyebrow}`} />
            <i className={`${styles.block} ${styles.title}`} />
            <i className={`${styles.block} ${styles.subtitle}`} />
          </div>
          <i className={`${styles.block} ${styles.action}`} />
        </header>
        <section className={styles.body}>
          <div className={styles.stats}>
            {[0, 1, 2].map((item) => (
              <div className={styles.stat} key={item}>
                <i className={`${styles.block} ${styles.statLabel}`} />
                <i className={`${styles.block} ${styles.statValue}`} />
                <i className={`${styles.block} ${styles.statCaption}`} />
              </div>
            ))}
          </div>
          <div className={styles.panels}>
            <div className={styles.panel}>
              <i className={`${styles.block} ${styles.panelTitle}`} />
              {[0, 1, 2, 3].map((item) => (
                <i className={`${styles.block} ${styles.panelRow}`} key={item} />
              ))}
            </div>
            <div className={`${styles.panel} ${styles.tablePanel}`}>
              <i className={`${styles.block} ${styles.panelTitle}`} />
              {[0, 1, 2, 3, 4].map((item) => (
                <i className={`${styles.block} ${styles.tableRow}`} key={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
