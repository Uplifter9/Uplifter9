from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")
        page.wait_for_selector("canvas")

        # Give the scene time to load
        page.wait_for_timeout(1000)

        # Get the dimensions of the page
        page_size = page.viewport_size
        center_x = page_size['width'] / 2
        center_y = page_size['height'] / 2

        # Simulate a drag to rotate the globe
        page.mouse.move(center_x, center_y)
        page.mouse.down()
        page.mouse.move(center_x - 400, center_y)
        page.mouse.up()

        # Wait for the animation to update
        page.wait_for_timeout(1000)

        page.screenshot(path="jules-scratch/verification/final_verification.png")
        browser.close()

run()
