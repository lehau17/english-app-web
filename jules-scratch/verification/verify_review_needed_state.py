from playwright.sync_api import sync_playwright, expect
import re

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # Fill in the email and password
    page.get_by_label("Địa chỉ Email").fill("student@gmail.com")
    page.get_by_label("Mật khẩu").fill("123456aA@")

    # Click the login button
    page.get_by_role("button", name="Bắt đầu học").click()

    # Wait for the URL to change, indicating a successful login.
    # I'll wait for up to 30 seconds.
    expect(page).not_to_have_url(re.compile(".*login.*"), timeout=30000)

    # Take a screenshot of the page after login
    page.screenshot(path="jules-scratch/verification/after_login.png")

    browser.close()