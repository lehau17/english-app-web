from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the login page
    page.goto("http://localhost:5173/login", timeout=60000)

    # Fill in the login form
    page.locator('input[id="email"]').fill("student@gmail.com")
    page.locator('input[id="password"]').fill("123456aA@")
    page.locator('button[type="submit"]').click()

    # Wait for navigation to the home page after login
    page.wait_for_url("http://localhost:5173/", timeout=60000)

    # Click on the "Xem tất cả" link to go to the classroom page
    page.locator("text=Xem tất cả").click()

    # Wait for navigation to the classroom page
    page.wait_for_url("http://localhost:5173/classroom", timeout=60000)

    # Wait for the classroom card to be visible
    classroom_card_selector = "div[class*='ClassroomCard']" # Using a more robust selector
    page.wait_for_selector(classroom_card_selector, timeout=60000)

    # Click on the first classroom card
    page.locator(classroom_card_selector).first.click()

    # Wait for navigation to the classroom detail page
    page.wait_for_url("http://localhost:5173/classroom-detail/**", timeout=60000)

    # Click on the first lesson to expand it
    lesson_selector = "div[class*='LessonRow']"
    page.wait_for_selector(lesson_selector, timeout=60000)
    page.locator(lesson_selector).first.click()

    # Click on the "Start" button for the first reading activity
    start_button_selector = "li:has-text('Reading') >> text=Bắt đầu"
    page.wait_for_selector(start_button_selector, timeout=60000)
    page.locator(start_button_selector).first.click()

    # Wait for the reading activity to be visible
    page.wait_for_url("**/learn/**", timeout=60000)
    reading_activity_selector = "div.rounded-xl.border.border-gray-200.bg-white.p-5:has-text('Đoạn văn')"
    page.wait_for_selector(reading_activity_selector, timeout=60000)

    # Find the paragraph within the reading activity
    paragraph = page.locator(f"{reading_activity_selector} p")

    # Select text
    paragraph.select_text()

    # Right click
    paragraph.click(button='right')

    # Wait for the menu to appear
    page.wait_for_selector("text=Translate", timeout=5000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)