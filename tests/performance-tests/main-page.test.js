import { check } from "k6";
import { MainPageService } from "../services/main-page.service.js";
import { given, scenario, then, when } from "../setup.js";

export const options = {
    vus: 1000,
    duration: "10m",
    iterations: 1000,
    thresholds: {
        http_req_duration: ["p(95)<3000", "p(99)<5000"],
    },
};

export default function () {
    scenario(
        "Die Startseite enthält 'Wir unterstützen Sie dabei, alle Ebenen Ihres Testprozesses nachhaltig zu optimieren'",
        () => {
            const mainPage = new MainPageService();
            const request = mainPage.getMainPage();
            given(() => {
                check(true, {
                    "ein User surft im Internet": (r) => r, // auto-true
                });
            });

            when(() => {
                check(request, {
                    "ein User betritt die Startseite von 'qytera.de'": (r) => r.status === 200,
                });
            });

            then(() => {
                check(request, {
                    "die Startseite enthält den Text 'Wir unterstützen Sie dabei, alle Ebenen Ihres Testprozesses nachhaltig zu optimieren'":
                        (r) =>
                            r.body.includes(
                                "Wir unterstützen Sie dabei, alle Ebenen Ihres Testprozesses nachhaltig zu optimieren"
                            ),
                });
            });
        }
    );
}
