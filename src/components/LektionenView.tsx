{/* Sub-bar: Collection Title / Stats & Search */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl border transition-all ${
          isDark
            ? 'bg-black/40 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{t('lek_collection_mode')}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {words.length} {t('lek_words_stat')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentLesson ? getLessonDisplayTitle(currentLesson, language) : ''}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('lek_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium border ${
              isDark
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>
      </div>
