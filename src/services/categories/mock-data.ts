import type { Category } from '@/features/categories/types'

const now = '2026-01-01T08:00:00.000Z'

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-speakers',
    name: 'Speakers',
    description: 'PA speakers, monitors, and subwoofers for live and installed sound.',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-guitars',
    name: 'Guitars',
    description: 'Electric, acoustic, and bass guitars for stage and studio.',
    isActive: true,
    createdAt: '2026-01-02T08:00:00.000Z',
    updatedAt: '2026-01-02T08:00:00.000Z',
  },
  {
    id: 'cat-keyboards',
    name: 'Keyboards',
    description: 'Digital pianos, synthesizers, and arranger keyboards.',
    isActive: true,
    createdAt: '2026-01-03T08:00:00.000Z',
    updatedAt: '2026-01-03T08:00:00.000Z',
  },
  {
    id: 'cat-mixers',
    name: 'Mixers',
    description: 'Analog and digital mixing consoles for live and studio production.',
    isActive: true,
    createdAt: '2026-01-04T08:00:00.000Z',
    updatedAt: '2026-01-04T08:00:00.000Z',
  },
  {
    id: 'cat-amplifiers',
    name: 'Amplifiers',
    description: 'Guitar, bass, and power amplifiers.',
    isActive: true,
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'cat-microphones',
    name: 'Microphones',
    description: 'Dynamic, condenser, and wireless microphone systems.',
    isActive: true,
    createdAt: '2026-01-06T08:00:00.000Z',
    updatedAt: '2026-01-06T08:00:00.000Z',
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    description: 'Stands, cases, adapters, and general audio accessories.',
    isActive: true,
    createdAt: '2026-01-07T08:00:00.000Z',
    updatedAt: '2026-01-07T08:00:00.000Z',
  },
  {
    id: 'cat-cables',
    name: 'Cables',
    description: 'XLR, instrument, speaker, and patch cables.',
    isActive: true,
    createdAt: '2026-01-08T08:00:00.000Z',
    updatedAt: '2026-01-08T08:00:00.000Z',
  },
  {
    id: 'cat-power',
    name: 'Power Equipment',
    description: 'Power conditioners, UPS units, and power distribution.',
    isActive: true,
    createdAt: '2026-01-09T08:00:00.000Z',
    updatedAt: '2026-01-09T08:00:00.000Z',
  },
  {
    id: 'cat-other',
    name: 'Other',
    description: 'Miscellaneous inventory items not classified elsewhere.',
    isActive: false,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
]

export const CATEGORY_STORAGE_KEY = 'naknaa_categories_v3'
