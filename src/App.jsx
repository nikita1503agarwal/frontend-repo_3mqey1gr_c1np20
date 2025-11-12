import { useEffect, useMemo, useState } from 'react'

function App() {
  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backend}/api/courses`)
      if (!res.ok) throw new Error('Failed to load courses')
      const data = await res.json()
      setCourses(data.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const createSampleCourse = async () => {
    setMessage('')
    const sample = {
      title: 'Intro to Modern Web Development',
      subtitle: 'Build a real-world app from scratch',
      description: 'Learn the fundamentals of modern frontend and backend development with hands-on lessons and a capstone project.',
      thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      category: 'Web Development',
      level: 'Beginner',
      lessons: [
        { title: 'Welcome & Setup', content: 'Environment setup and tooling overview', video_url: '', order: 0 },
        { title: 'Frontend Basics', content: 'Components, state, and styling', video_url: '', order: 1 },
        { title: 'Backend Basics', content: 'APIs, routing, and persistence', video_url: '', order: 2 },
      ],
      is_published: true,
    }
    try {
      const res = await fetch(`${backend}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample),
      })
      if (!res.ok) throw new Error('Failed to create sample')
      setMessage('Sample course created!')
      await fetchCourses()
    } catch (e) {
      setMessage(e.message)
    }
  }

  const enroll = async (course) => {
    if (!email) {
      setMessage('Enter your email to enroll')
      return
    }
    setMessage('')
    try {
      const res = await fetch(`${backend}/api/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, course_id: course._id, status: 'active' }),
      })
      if (!res.ok) throw new Error('Failed to enroll')
      setMessage('You are enrolled!')
    } catch (e) {
      setMessage(e.message)
    }
  }

  const markLessonComplete = async (course, lessonOrder) => {
    if (!email) {
      setMessage('Enter your email to track progress')
      return
    }
    setMessage('')
    try {
      const res = await fetch(`${backend}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, course_id: course._id, lesson_order: lessonOrder, completed: true }),
      })
      if (!res.ok) throw new Error('Failed to update progress')
      setMessage('Progress saved!')
    } catch (e) {
      setMessage(e.message)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600"></div>
            <span className="font-semibold text-slate-800 text-lg">LumaLearn</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/" className="text-slate-600 hover:text-slate-900">Home</a>
            <a href="/test" className="text-slate-600 hover:text-slate-900">System Test</a>
            <a href="#catalog" className="text-slate-600 hover:text-slate-900">Catalog</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">A clean learning platform for modern teams</h1>
            <p className="mt-4 text-slate-600 text-lg">Create, publish, and track bite-sized courses. Enroll with your email and your progress is saved in the cloud.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#catalog" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">Browse courses</a>
              <button onClick={createSampleCourse} className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-black transition-colors">Create sample course</button>
            </div>
            {message && (
              <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-3 py-2 inline-block">{message}</p>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="text-sm text-slate-600">Your email</div>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@company.com" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className="mt-2 text-xs text-slate-500">Used for enrollments and progress tracking.</p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Featured courses</h2>
          <button onClick={fetchCourses} className="text-sm text-slate-600 hover:text-slate-900">Refresh</button>
        </div>
        {loading ? (
          <div className="text-slate-500">Loading courses…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-600">No courses yet. Create a sample to get started.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c._id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-slate-100" />
                )}
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{c.category || 'General'} • {c.level || 'All levels'}</div>
                  <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1">{c.title}</h3>
                  {c.subtitle && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{c.subtitle}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => setSelected(c)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View</button>
                    <button onClick={() => enroll(c)} className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Enroll</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-20">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px]">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden">
              {selected.thumbnail_url && (
                <img src={selected.thumbnail_url} alt={selected.title} className="h-48 w-full object-cover" />
              )}
              <div className="p-6">
                <div className="text-xs uppercase tracking-wide text-slate-500">{selected.category || 'General'} • {selected.level || 'All levels'}</div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{selected.title}</h3>
                {selected.description && <p className="mt-2 text-slate-600">{selected.description}</p>}

                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900">Lessons</h4>
                  <ol className="mt-2 space-y-2">
                    {(selected.lessons || []).sort((a,b)=>a.order-b.order).map((l) => (
                      <li key={l.order} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{l.order + 1}. {l.title}</div>
                          {l.content && <div className="text-xs text-slate-600 line-clamp-1">{l.content}</div>}
                        </div>
                        <button onClick={() => markLessonComplete(selected, l.order)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Mark done</button>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => enroll(selected)} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">Enroll now</button>
                  <button onClick={() => setSelected(null)} className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Built with love for learning. Visit System Test to check connectivity.
      </footer>
    </div>
  )
}

export default App
