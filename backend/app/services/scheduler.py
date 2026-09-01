import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.services.amfi_fetcher import get_latest_nav

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nav_sync")

scheduler = BackgroundScheduler()

def sync_active_navs():
    """Background task to fetch latest NAVs and log sync status."""
    db: Session = SessionLocal()
    try:
        holdings = db.query(models.Holding).all()
        if not holdings:
            logger.info("[NAV Sync] No active holdings found to sync.")
            return

        logger.info(f"[NAV Sync] Starting daily sync for {len(holdings)} schemes...")
        for item in holdings:
            if not item.scheme_code.startswith("CUSTOM"):
                nav_info = get_latest_nav(item.scheme_code)
                if nav_info and nav_info.get("nav", 0) > 0:
                    logger.info(
                        f"[NAV Sync] Updated {item.scheme_name} ({item.scheme_code}): ₹{nav_info['nav']} as of {nav_info['date']}"
                    )
        logger.info("[NAV Sync] Daily NAV sync cycle complete.")
    except Exception as e:
        logger.error(f"[NAV Sync Error] Failed to complete sync: {e}")
    finally:
        db.close()

def start_scheduler():
    """Starts the background scheduler configured for 11:05 PM IST daily."""
    # AMFI mandates AMC updates by 11:00 PM IST; run sync at 23:05
    scheduler.add_job(
        sync_active_navs,
        trigger=CronTrigger(hour=23, minute=5, timezone="Asia/Kolkata"),
        id="amfi_daily_sync",
        name="Sync AMFI Closing NAVs",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("[Scheduler] Background NAV sync scheduler started (23:05 IST daily).")

def stop_scheduler():
    """Stops the background scheduler on shutdown."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[Scheduler] Background scheduler shut down.")