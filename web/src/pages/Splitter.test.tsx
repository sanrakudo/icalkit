import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Splitter from './Splitter';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('Splitter Component', () => {
  it('should render the component', () => {
    render(<Splitter />);

    expect(screen.getByText(/iCalKit Splitter/i)).toBeInTheDocument();
    expect(
      screen.getByText(/大きなiCalファイルを分割して/i),
    ).toBeInTheDocument();
  });

  it('should display file upload area', () => {
    render(<Splitter />);

    expect(screen.getByText(/iCalファイルをドロップ/i)).toBeInTheDocument();
    expect(screen.getByText(/ファイルを選択/i)).toBeInTheDocument();
  });

  it('should handle valid ICS file upload', async () => {
    render(<Splitter />);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20240101T120000Z
DTEND:20240101T130000Z
SUMMARY:Test Event 1
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20240102T120000Z
DTEND:20240102T130000Z
SUMMARY:Test Event 2
END:VEVENT
END:VCALENDAR`;

    const file = new File([icsContent], 'calendar.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/calendar.ics/i)).toBeInTheDocument();
      expect(screen.getByText(/総イベント数/i)).toBeInTheDocument();
    });
  });

  it('should display event count after file upload', async () => {
    render(<Splitter />);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20240101T120000Z
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20240102T120000Z
SUMMARY:Event 2
END:VEVENT
BEGIN:VEVENT
UID:test3@example.com
DTSTART:20240103T120000Z
SUMMARY:Event 3
END:VEVENT
END:VCALENDAR`;

    const file = new File([icsContent], 'test.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      // Check if the event count is displayed (looking for "3")
      const eventCountElement = screen.getByText((_content, element) => {
        return element?.textContent === '3';
      });
      expect(eventCountElement).toBeInTheDocument();
    });
  });

  it('should show chunk size slider after file upload', async () => {
    render(<Splitter />);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const file = new File([icsContent], 'test.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(
        screen.getByText(/1ファイルあたりのイベント数/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  it('should calculate correct number of output files', async () => {
    render(<Splitter />);

    // Create a calendar with 1500 events
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Test//Test//EN\n`;
    for (let i = 0; i < 1500; i++) {
      icsContent += `BEGIN:VEVENT\nUID:test${i}@example.com\nDTSTART:20240101T120000Z\nSUMMARY:Event ${i}\nEND:VEVENT\n`;
    }
    icsContent += `END:VCALENDAR`;

    const file = new File([icsContent], 'large.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      // Default chunk size is 1000, so 1500 events should result in 2 files
      const filesCountElement = screen.getByText((_content, element) => {
        return element?.textContent === '2';
      });
      expect(filesCountElement).toBeInTheDocument();
    });
  });

  it('should show split button after file upload', async () => {
    render(<Splitter />);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const file = new File([icsContent], 'test.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/分割してダウンロード/i)).toBeInTheDocument();
    });
  });

  it('should show event list toggle button', async () => {
    render(<Splitter />);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
SUMMARY:Test Event
END:VEVENT
END:VCALENDAR`;

    const file = new File([icsContent], 'test.ics', {
      type: 'text/calendar',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/📅 イベント一覧/i)).toBeInTheDocument();
    });
  });
});
