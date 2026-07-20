import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('PDF Batch Gen — E2E workflows', () => {

  test('loads and shows empty state', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByText('PDF Batch Gen')).toBeVisible()
    await expect(page.getByText('Upload a PDF template to begin')).toBeVisible()
  })

  test('language switch to Arabic changes dir to rtl', async ({ page }) => {
    await page.goto(BASE)
    await page.getByRole('button', { name: 'Switch to AR' }).click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // Switch back
    await page.getByRole('button', { name: 'Switch to EN' }).click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('Ctrl+? opens help dialog', async ({ page }) => {
    await page.goto(BASE)
    await page.keyboard.press('Shift+?')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('zoom keyboard shortcuts work', async ({ page }) => {
    await page.goto(BASE)
    // Initial zoom: 100%
    await expect(page.getByText('100%')).toBeVisible()
    await page.keyboard.press('Control+Equal')
    await expect(page.getByText('110%')).toBeVisible()
    await page.keyboard.press('Control+Minus')
    await expect(page.getByText('100%')).toBeVisible()
  })

  test('sidebar steps open and close', async ({ page }) => {
    await page.goto(BASE)
    await page.getByRole('button', { name: /PDF Template/ }).click()
    await expect(page.getByText('Choose or drop a PDF')).toBeVisible()
    // Close by clicking again
    await page.getByRole('button', { name: /PDF Template/ }).click()
    await expect(page.getByText('Choose or drop a PDF')).not.toBeVisible()
  })

  test('validation dialog shows errors without prerequisites', async ({ page }) => {
    await page.goto(BASE)
    await page.keyboard.press('Control+Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Upload a PDF template.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate PDFs' })).toBeDisabled()
    await page.keyboard.press('Escape')
  })

})
