from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the parent login page
    page.goto("http://localhost:5173/parent-login")

    # Fill in the login form
    page.get_by_label("Email").fill("parent@gmail.com")
    page.get_by_label("Mật khẩu").fill("123456aA@")

    # Click the login button
    page.get_by_role("button", name="Đăng nhập").click()

    # Wait for navigation to the parent home page
    page.wait_for_url("http://localhost:5173/parent-home")

    # Navigate to the progress report page
    page.goto("http://localhost:5173/parent/reports/child-01")

    # Wait for the page to load
    page.wait_for_selector("h1:has-text('Báo cáo tiến độ học tập')")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)