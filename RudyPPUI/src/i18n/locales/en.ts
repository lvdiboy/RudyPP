/*
 * English UI text. This object defines the shape of every message: zh.ts must provide the same
 * keys with the same types, and TypeScript fails the build if one is missing.
 *
 * Rule: components never hard-code user-visible text. Add it here and in zh.ts, then read it with
 * `const { t } = useI18n()`. Text that contains values is a function, e.g. `welcome(name)`.
 */
export const en = {
  common: {
    skipToContent: 'Skip to content',
    footer: 'Built by Rudy with React, TypeScript and Vite.',
    close: 'Close',
    tryAgain: 'Try again',
  },

  nav: {
    accountLabel: 'Account',
    siteLabel: 'Site',
    home: 'Home',
    dashboard: 'Dashboard',
    account: 'Account',
    learning: 'Learning',
    journal: 'Journal',
    project: 'Project',
    playground: 'Playground',
  },

  // Role names from the token's "rol" claim (without the ROLE_ prefix)
  roles: {
    USER: 'User',
    MANAGER: 'Manager',
    ADMIN: 'Admin',
    TEMP_USER: 'Temporary user',
  } as Record<string, string>,

  auth: {
    logIn: 'Log in',
    loggingIn: 'Logging in…',
    logOut: 'Log out',
    loggingOut: 'Logging out…',
    panelTitle: 'Welcome back',
    panelIntro: 'Log in with your RudyPP account.',
    userName: 'User name',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    rememberMe: 'Keep me signed in for 7 days',
    enterUserName: 'Enter your user name.',
    enterPassword: 'Enter your password.',
    wrongCredentials: 'That user name and password don’t match. Check them and try again.',
    loginFailed: 'Something went wrong while logging in. Try again.',
    sessionExpired: 'Your session expired. Log in again to continue.',
    sessionRevoked:
      'Your session ended, possibly because you logged in somewhere else. Log in again.',
  },

  userMenu: {
    accountPrefix: 'Account: ',
    signedIn: 'Signed in',
    roles: 'Roles',
    noRoles: 'None',
    sessionEnds: 'Session ends',
    remembered: ' (remembered)',
  },

  // Backend messages are English only, so the UI shows these instead (see errorMessage.ts)
  errors: {
    network: 'Could not reach the server. Check that it is running and try again.',
    unauthorized: 'You are not signed in, or your session has ended.',
    forbidden: 'You do not have permission to do that.',
    server: 'The server had a problem. Try again in a moment.',
    requestFailed: (status: number) => `Request failed (HTTP ${status}).`,
    userNameTaken: 'That user name is already taken.',
    roleNotFound: 'That role does not exist.',
    invalidInput: 'Some of the details are not valid. Check them and try again.',
    userNotFound: 'That user does not exist.',
    badCredentials: 'Wrong user name or password.',
  },

  loginPage: {
    title: 'Log in – RudyPP',
    pitch: 'Pick up where you left off.',
    pitchText:
      'Log in to open the learning lab. Your account page keeps your session and the people learning alongside you.',
    heading: 'Log in',
    intro: 'Use your RudyPP user name and password.',
  },

  notFound: {
    title: 'Page not found – RudyPP',
    heading: 'This page doesn’t exist.',
    text: 'The link may be old, or the address has a typo.',
    cta: 'Go to the home page',
  },

  // The public home page (OceanHome). The headline is split so the emphasized part gets the underline.
  home: {
    title: 'Rudy — Go a little further',
    brandLabel: (name: string) => `${name}’s home page`,
    headerNote: 'One life, more than one possibility.',
    menuOpen: 'Menu',
    menuClose: 'Close',
    navLabel: 'Home page',
    navExplore: 'Explore',
    navAbout: 'About',
    navCta: 'Look around',
    photoAlt:
      'A person stands on rocks by the sea, one arm raised toward the water, under a wide blue sky with white clouds.',
    heroTag: (name: string) => `PERSONAL SPACE / ${name.toUpperCase()}`,
    heroMotto: 'Stay curious · Keep going',
    greeting: (name: string) => `HELLO, WORLD. I'M ${name.toUpperCase()}.`,
    titleLine1: 'Go a little',
    titleLead: '',
    titleEmphasis: 'further',
    titleEnd: '.',
    introLine1: 'I write code, and I collect views.',
    introLine2: 'Here I keep pieces of what I make, think and live.',
    exploreCta: 'Step into my world',
    captionLine1: 'Some answers',
    captionLine2: 'come after you set out.',
    scrollHint: 'Scroll for more',
    scrollHintSub: '',
    pauseMotion: 'Pause motion',
    playMotion: 'Play motion',
    exploreEyebrow: 'A FEW SIDES OF ME',
    exploreTitle: 'More than one side.',
    exploreText: 'Things I want to make, and moments worth keeping.',
    chapters: {
      build: {
        title: 'Build',
        tag: 'BUILD',
        text: 'Turning curiosity into work, and ideas into things you can touch.',
        detail: 'Projects and experiments',
      },
      keep: {
        title: 'Keep',
        tag: 'KEEP',
        text: 'Writing down what I’ve figured out, and the questions still open.',
        detail: 'Writing and notes',
      },
      see: {
        title: 'See',
        tag: 'SEE',
        text: 'Getting outside to see the sea and the hills, and keeping life’s small moments.',
        detail: 'Photos and travel',
      },
    },
    chapterEnd: '.',
    viewIdea: 'See the idea',
    aboutEyebrow: 'ALWAYS A WORK IN PROGRESS',
    aboutTitleLine1: (name: string) => `Hi, I’m ${name}.`,
    aboutTitleLine2: 'Glad to meet you here.',
    aboutTextLine1: 'This is my personal space, with room for work, notes and photos.',
    aboutTextLine2: 'Making things slowly, and letting life in slowly too.',
    backToTop: 'Back to top',
    footerTag: (name: string) => `${name.toUpperCase()} / PERSONAL SPACE`,
    footerMotto: 'Stay curious, stay passionate.',
    footerBackToTop: 'BACK TO TOP ↗',
    dialogTitle: (title: string) => `${title} is still growing.`,
    dialogText: (detail: string) =>
      `This is a preview of where the home page is going. The ${detail.toLowerCase()} section will be built step by step; nothing made-up is shown here in the meantime.`,
    dialogClose: 'Keep exploring',
  },

  // The front-end learning module (/dashboard/learning)
  learning: {
    title: 'Front-end learning – RudyPP',
    heading: 'Learning the front end, one small build at a time.',
    lead: 'I come from Java and Spring Boot. This site is where I learn React and TypeScript in the open: notes on what I study, the projects I build, and experiments you can try.',
    readJournal: 'Read the journal',
    tryPlayground: 'Try the playground',
    nowBuilding: 'Now building',
    milestone: 'Milestone 3 of 10: logging in',
    statusDone: 'Done',
    statusNext: 'Next',
    checklist: {
      routing: 'Routing and shared UI',
      login: 'JWT log in and log out',
      signUp: 'Sign-up page',
    },
    topicsHeading: 'What I’m learning',
    topics: {
      react: {
        title: 'React components',
        summary: 'Splitting a page into small functions that take props and return markup.',
      },
      typescript: {
        title: 'TypeScript',
        summary:
          'Types for props and API data, so mistakes show up in the editor, not the browser.',
      },
      css: {
        title: 'Modern CSS',
        summary:
          'Grid, custom properties and CSS Modules for layouts that adapt from phone to desktop.',
      },
    },
    journalHeading: 'Journal',
    journalIntro: 'These are sample entries. Real posts arrive once the journal has its own pages.',
    sampleTag: 'Sample',
    // SAMPLE CONTENT: placeholder entries until a journal API exists (milestone 6)
    entries: {
      firstComponent: {
        title: 'My first component was just a function',
        excerpt:
          'Coming from Java classes, it took a minute to accept that a component is a function that returns markup, and that is the whole thing.',
      },
      cssModules: {
        title: 'CSS Modules: scoped class names without a naming scheme',
        excerpt:
          'Every .module.css file gets unique class names at build time, so .card in one file never collides with .card in another.',
      },
      springPage: {
        title: 'Reading a Spring Page from the browser’s side',
        excerpt:
          'The users endpoint returns a Spring Page. Mapping its content and page metadata to TypeScript types is next on the list.',
      },
    },
    projectHeading: 'Featured project',
    projectSummary:
      'A Spring Boot API with JWT login, role-based access and Redis-backed token revocation. The site you are reading is its new React front end, built in the same repository.',
    stackLabel: 'Built with',
    playgroundHeading: 'Playground',
    playgroundIntro:
      'Small experiments live here. The first one is about design tokens: one CSS custom property decides the accent color of everything in the card below.',
  },

  playground: {
    legend: 'Accent color',
    accents: {
      highlight: 'Highlighter yellow',
      pink: 'Sticker pink',
      teal: 'Lab teal',
    },
    previewTitle: 'Preview card',
    // The CSS property name is shown as code between these two parts
    previewTextBefore: 'The band, badge and underline all read ',
    previewTextAfter: '. Change it once and they all follow.',
  },

  // Opened from the user menu
  account: {
    title: 'Account – RudyPP',
    heading: (name: string) => `Your account, ${name}`,
    subtitle:
      'Your session details and the people on RudyPP. Everything here comes from your token and the API.',
    sessionHeading: 'Your session',
    userName: 'User name',
    roles: 'Roles',
    ends: 'Ends',
    onThisDevice: 'On this device',
    remembered: 'Remembered for 7 days',
    untilBrowserCloses: 'Until you close the browser',
    membersHeading: 'Members',
    membersNotAllowed: 'Your role can’t view the member list.',
    membersLoading: 'Loading members…',
    // The count itself is shown in bold before this text
    // Return type declared so other languages may return any string, not just these two
    membersCount: (count: number): string =>
      count === 1 ? 'person has an account' : 'people have an account',
    membersShowingFirst: (count: number) => `Showing the first ${count}.`,
    keepLearningHeading: 'Keep learning',
    journalShortcut: 'Journal',
    journalShortcutText: 'Notes from the latest milestones',
    playgroundShortcut: 'Playground',
    playgroundShortcutText: 'Try the design-token experiment',
  },
  // The personal workspace shell (/dashboard and its modules)
  workspace: {
    brandSub: 'PERSONAL SPACE',
    navLabel: 'Workspace',
    overviewNav: 'Overview',
    groups: {
      daily: 'Daily tools',
      create: 'Learning and making',
      future: 'Coming later',
    },
    planned: 'Planned',
    backHome: 'Back to home',
    account: 'Account',
    localOnly: 'Saved only in this browser',
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    root: 'Workspace',
    // Shared by the sidebar, the overview cards and page titles; ids match features/workspace/modules.ts
    modules: {
      learning: {
        title: 'Front-end learning',
        description:
          'Topics, a sample journal, the RudyPP project and the design-token playground.',
      },
      notes: {
        title: 'Quick notes',
        description: 'Short thoughts, kept as plain text.',
      },
      bookmarks: {
        title: 'Bookmarks',
        description: 'Links worth coming back to.',
      },
      tasks: {
        title: 'To-dos',
        description: 'Small things to get done.',
      },
      knowledge: {
        title: 'Knowledge base',
        description: 'Longer writing and organized notes.',
      },
      gallery: {
        title: 'Photo album',
        description: 'Photos from places and days worth keeping.',
      },
    },
    overview: {
      title: 'Workspace – RudyPP',
      greeting: (name: string) => `Hello, ${name}`,
      intro: 'A calm, orderly place for ideas and everyday things.',
      modulesHeading: 'Your tools',
      notesStat: (count: number): string => (count === 1 ? '1 note' : `${count} notes`),
      bookmarksStat: (count: number): string => (count === 1 ? '1 bookmark' : `${count} bookmarks`),
      tasksStat: (count: number): string => `${count} open`,
      learningStat: 'Lessons and experiments',
      recentNotes: 'Recent notes',
      recentBookmarks: 'Recent bookmarks',
      openTasks: 'Open to-dos',
      viewAll: (section: string) => `View all ${section.toLowerCase()}`,
      noNotes: 'No notes yet.',
      writeFirstNote: 'Write the first note',
      noBookmarks: 'No bookmarks yet.',
      addFirstBookmark: 'Add a link',
      noOpenTasks: 'Nothing open right now.',
      addTask: 'Add a to-do',
      localNotice:
        'Notes, bookmarks and to-dos are saved only in this browser for now. They are not synced to other devices or backed up on a server.',
    },
    // Errors from the browser storage layer, shared by all local modules
    storage: {
      corrupt:
        'The saved data for this section can’t be read, so nothing was changed. You can reset this section to start again.',
      reset: 'Reset this section',
      resetTitle: 'Reset this section?',
      resetMessage:
        'This deletes the unreadable data for this section in this browser. It can’t be undone.',
      resetConfirm: 'Reset',
      unavailable:
        'This browser isn’t letting the site store data (for example private mode or blocked site data), so changes can’t be saved.',
      quota: 'Not saved: the browser’s storage for this site is full. Your input is still here.',
      notFound:
        'This item no longer exists, possibly deleted in another tab. Copy your text if you need it.',
      changedElsewhere: 'This item was changed in another tab. Saving will replace that version.',
      updatedElsewhere: 'Updated from another tab.',
    },
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    required: 'This field is required.',
    tooLong: (max: number) => `Keep this to ${max} characters or fewer.`,
    counter: (count: number, max: number) => `${count} / ${max}`,
    notFound: {
      title: 'Not found – RudyPP',
      heading: 'This workspace page doesn’t exist.',
      text: 'The address may be mistyped, or the section may not be built yet.',
      cta: 'Back to the overview',
    },
  },

  notes: {
    title: 'Quick notes – RudyPP',
    intro:
      'Short thoughts in plain text. Longer, organized writing will live in the knowledge base.',
    newNote: 'New note',
    searchLabel: 'Search notes',
    editorNew: 'New note',
    editorEdit: 'Edit note',
    titleLabel: 'Title',
    bodyLabel: 'Note',
    save: 'Save note',
    saving: 'Saving…',
    saved: 'Note saved.',
    deleted: 'Note deleted.',
    deleteTitle: 'Delete this note?',
    deleteMessage: (title: string) => `“${title}” will be removed from this browser.`,
    discardTitle: 'Discard your changes?',
    discardMessage: 'The unsaved text in this note will be lost.',
    discard: 'Discard',
    keepEditing: 'Keep editing',
    draftFound: 'You have an unsaved draft from your last visit.',
    restoreDraft: 'Restore draft',
    discardDraft: 'Discard draft',
    draftNote: 'Your typing is kept as a draft in this browser until you save or discard it.',
    empty: 'No notes yet. Write down the first thing on your mind.',
    noResults: (query: string) => `No notes match “${query}”.`,
    updated: (date: string) => `Updated ${date}`,
    listLabel: 'Notes',
  },

  bookmarks: {
    title: 'Bookmarks – RudyPP',
    intro: 'Links worth coming back to. Only the details you enter are saved; no page is fetched.',
    newBookmark: 'Add bookmark',
    searchLabel: 'Search bookmarks',
    editorNew: 'Add bookmark',
    editorEdit: 'Edit bookmark',
    titleLabel: 'Title',
    urlLabel: 'Address (URL)',
    urlHint: 'A full address starting with http:// or https://',
    urlInvalid: 'Enter a full address that starts with http:// or https://.',
    descriptionLabel: 'Short description (optional)',
    save: 'Save bookmark',
    saving: 'Saving…',
    saved: 'Bookmark saved.',
    deleted: 'Bookmark deleted.',
    deleteTitle: 'Delete this bookmark?',
    deleteMessage: (title: string) => `“${title}” will be removed from this browser.`,
    newTab: 'Opens in a new tab',
    empty: 'No bookmarks yet. Add a link you want to keep.',
    noResults: (query: string) => `No bookmarks match “${query}”.`,
    added: (date: string) => `Added ${date}`,
    listLabel: 'Bookmarks',
  },

  tasks: {
    title: 'To-dos – RudyPP',
    intro: 'Small things to get done. Mark them done, reopen them, or clear them out.',
    newLabel: 'New to-do',
    add: 'Add',
    adding: 'Adding…',
    added: 'To-do added.',
    deleted: 'To-do deleted.',
    filterLabel: 'Show',
    filters: {
      all: 'All',
      open: 'Open',
      done: 'Done',
    },
    summary: (open: number, done: number) => `${open} open · ${done} done`,
    statusDone: 'Done',
    statusOpen: 'Open',
    markedDone: (title: string) => `“${title}” marked as done.`,
    reopened: (title: string) => `“${title}” reopened.`,
    deleteTitle: 'Delete this to-do?',
    deleteMessage: (title: string) => `“${title}” will be removed from this browser.`,
    empty: {
      all: 'No to-dos yet. Add the first one above.',
      open: 'Nothing open. Everything is done.',
      done: 'Nothing is marked as done yet.',
    },
    listLabel: 'To-dos',
  },
};

export type Messages = typeof en;
