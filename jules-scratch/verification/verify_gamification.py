import time
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        email = "student@gmail.com"
        password = "123456aA@"

        try:
            # Step 1: Log in
            page.goto("http://localhost:5173/login", timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            page.fill('input[name="email"]', email)
            page.fill('input[name="password"]', password)
            page.click('button[type="submit"]')

            # Step 2: Navigate to the classroom page
            page.goto("http://localhost:5173/classroom", timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            page.screenshot(path="jules-scratch/verification/00_classroom_page.png")

            # Step 3: Click on the map button
            map_button_selector = "a[href='/classroom/1/map']"
            page.wait_for_selector(map_button_selector, state='visible', timeout=60000)
            page.click(map_button_selector)

            # Step 4: Wait for navigation to the Lesson Map Page and take a screenshot
            expect(page).to_have_url(r'/classroom/1/map', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            page.screenshot(path="jules-scratch/verification/01_lesson_map.png")

            # Step 5: Click on an active lesson
            active_lesson_selector = "div.relative.w-16.h-16"
            page.wait_for_selector(active_lesson_selector, state='visible', timeout=60000)
            page.click(active_lesson_selector)

            # Step 6: Wait for navigation and take a screenshot of the Lesson Player Page
            expect(page).to_have_url(r'/learn/1/3', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            page.screenshot(path="jules-scratch/verification/02_lesson_player.png")

            # Step 7: Click the back button
            back_button_selector = "button[aria-label='Quay lại lớp học']"
            page.wait_for_selector(back_button_selector, state='visible', timeout=60000)
            page.click(back_button_selector)

            # Step 8: Wait for navigation back to the map and take a final screenshot
            expect(page).to_have_url(r'/classroom/1/map', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            page.screenshot(path="jules-scratch/verification/03_back_to_map.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            print(page.content())
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()