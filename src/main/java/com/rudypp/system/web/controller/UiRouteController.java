package com.rudypp.system.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * @author Rudy Lyu
 * The React UI's client-side routes. Opening or refreshing /login in the browser asks the server for /login,
 * which has no file; forwarding to index.html lets React Router render the right page.
 * Only known routes are listed, so unknown paths, APIs and missing assets still get real 401/404 responses.
 * Keep in sync with RudyPPUI/src/app/router.tsx and SecurityConstants.STATIC_WHITELIST.
 * A plain @Controller (not @RestController), so WebConfig doesn't add the /api prefix.
 */
@Controller
public class UiRouteController {

    @GetMapping({"/login", "/dashboard", "/dashboard/learning", "/dashboard/notes", "/dashboard/bookmarks",
            "/dashboard/tasks", "/account"})
    public String forwardToUi() {
        return "forward:/index.html";
    }
}
