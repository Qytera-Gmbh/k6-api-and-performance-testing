import { check } from "k6";
import { MainPageService } from "../services/main-page.service.js";
import { given, scenario, then, when } from "../setup.js";

export const options = {
    vus: 1,
    duration: "10m",
    iterations: 1,
    thresholds: {
        checks: [{ threshold: "rate == 1.00", abortOnFail: false }],
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
