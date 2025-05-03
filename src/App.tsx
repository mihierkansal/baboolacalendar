import { createMemo, createSignal, For, Show } from "solid-js";

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

interface CalendarEvent {
  name: string;
  desc: string;
  date: {
    monthIdx: number;
    day: number;
    year?: number | undefined;
  };
  isCustom?: boolean;
}
function App() {
  const NUMBER_OF_CELLS_IN_CALENDAR_GRID = 7 * 6;

  const monthIndex = createSignal(new Date().getMonth());
  const year = createSignal(new Date().getFullYear());
  const date = createSignal(new Date().getDate());

  const fullDate = createMemo(() => {
    return new Date(year[0](), monthIndex[0](), date[0]());
  });

  const daysInMonth = createMemo(() => {
    switch (fullDate().getMonth() + 1) {
      case 1:
        return 31;
      case 2:
        return fullDate().getFullYear() % 4 === 0 ? 29 : 28;
      case 3:
        return 31;
      case 4:
        return 30;
      case 5:
        return 31;
      case 6:
        return 30;
      case 7:
        return 31;
      case 8:
        return 31;
      case 9:
        return 30;
      case 10:
        return 31;
      case 11:
        return 30;
      case 12:
        return 31;
      default:
        return 30;
    }
  });

  const paddingDays = createMemo(() => {
    return new Date(year[0](), monthIndex[0](), 1).getDay();
  });

  const remainingCalendarGridCells = createMemo(
    () => NUMBER_OF_CELLS_IN_CALENDAR_GRID - paddingDays() - daysInMonth()
  );

  const events = createSignal<CalendarEvent[]>([
    {
      name: "New year",
      desc: "Beginning of the year - make a resolution!",
      date: {
        monthIdx: 0,
        day: 1,
      },
    },
    {
      name: "Independence day",
      desc: "Celebrates freedom from Great Britain",
      date: {
        monthIdx: 6,
        day: 4,
      },
    },
    {
      name: "Christmas",
      desc: "Celebrates birth of Jesus Christ",
      date: {
        monthIdx: 11,
        day: 25,
      },
    },
    ...getCustomEvents(),
  ]);

  const newEventFormVis = createSignal<Date>();
  return (
    <>
      <div class="topbar">
        <button
          onClick={() => {
            monthIndex[1]((v) => {
              if (
                v === 0 // January.
              ) {
                v = 11;
                year[1]((v) => --v);
              } else {
                v--;
              }
              return v;
            });
          }}
        >
          <span>◀</span>
        </button>
        <h1>
          {MONTHS[monthIndex[0]()]} {year[0]()}
        </h1>
        <button
          onClick={() => {
            monthIndex[1]((v) => {
              if (
                v === 11 // December. NOT november, as it may seem.
              ) {
                v = 0;
                year[1]((v) => ++v);
              } else {
                v++;
              }
              return v;
            });
          }}
        >
          <span>▶</span>
        </button>
      </div>
      <div class="days">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div class="calendar-main">
        <For each={generateAscendingArray(paddingDays())}>
          {(_) => {
            return <div></div>;
          }}
        </For>
        <For each={generateAscendingArray(daysInMonth())}>
          {(day) => {
            return (
              <div
                title="Click to create event"
                style={
                  newEventFormVis[0]()
                    ? "pointer-events:none"
                    : "cursor:pointer;"
                }
                onClick={() => {
                  newEventFormVis[1](new Date(year[0](), monthIndex[0](), day));
                }}
                class={
                  checkDateEquals(
                    new Date(year[0](), monthIndex[0](), day),
                    new Date()
                  )
                    ? "today"
                    : ""
                }
              >
                {day}

                <For
                  each={events[0]().filter((event) => {
                    return (
                      event.date.day === day &&
                      event.date.monthIdx === monthIndex[0]() &&
                      (!event.date.year || event.date.year === year[0]())
                    );
                  })}
                >
                  {(event) => {
                    const evDetailedViewVis = createSignal(false);
                    return (
                      <>
                        <div
                          onClick={(e) => {
                            if (!evDetailedViewVis[0]()) {
                              evDetailedViewVis[1](true);
                              e.stopPropagation();
                            } else {
                              evDetailedViewVis[1](false);
                            }
                          }}
                          title={event.name}
                          class={
                            "calendar-event " +
                            (event.isCustom ? "custom" : "preset")
                          }
                        >
                          {event.name}
                          <Show when={evDetailedViewVis[0]()}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              class="event-details"
                            >
                              <div class="event-description">{event.desc}</div>
                              <div class="buttons">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    evDetailedViewVis[1](false);

                                    removeEventFromLS(event);
                                    events[1]((v) => [
                                      ...v.filter(
                                        (ev) =>
                                          JSON.stringify(ev) !==
                                          JSON.stringify(event)
                                      ),
                                    ]);
                                  }}
                                >
                                  <span>Delete</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    evDetailedViewVis[1](false);
                                    console.log("clk");
                                  }}
                                >
                                  <span>OK</span>
                                </button>
                              </div>
                            </div>
                          </Show>
                        </div>
                      </>
                    );
                  }}
                </For>
              </div>
            );
          }}
        </For>
        <For each={generateAscendingArray(remainingCalendarGridCells())}>
          {(_) => <div></div>}
        </For>
      </div>
      <Show when={newEventFormVis[0]()}>
        <NewEventForm date={newEventFormVis[0]()!} />
      </Show>
    </>
  );

  function NewEventForm(props: { date: Date }) {
    const everyYear = createSignal(true);
    const name = createSignal("");
    const desc = createSignal("");

    return (
      <>
        <div class="dialog">
          <h3>New Event</h3>
          <label>
            Event name
            <input
              value={name[0]()}
              type="text"
              onChange={(e) => {
                name[1](e.target.value);
              }}
            />
          </label>
          <label>
            Event description
            <input
              value={desc[0]()}
              type="text"
              onChange={(e) => {
                desc[1](e.target.value);
              }}
            />
          </label>
          <label>
            <input
              type="checkbox"
              onChange={(e) => {
                everyYear[1](e.target.checked);
              }}
              checked={everyYear[0]()}
            />{" "}
            Every year?
          </label>
          <div class="buttons">
            <button
              onClick={() => {
                newEventFormVis[1](undefined);
              }}
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={() => {
                const newEvent: CalendarEvent = {
                  name: name[0](),
                  desc: desc[0](),
                  date: {
                    monthIdx: props.date.getMonth(),
                    day: props.date.getDate(),
                    year: everyYear[0]() ? undefined : props.date.getFullYear(),
                  },
                  isCustom: true,
                };
                events[1]((v) => {
                  v.push(newEvent);
                  return [...v];
                });
                addEventToLS(newEvent);
                newEventFormVis[1](undefined);
              }}
            >
              <span>Create</span>
            </button>
          </div>
        </div>
      </>
    );
  }
}
function generateAscendingArray(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1);
}
function checkDateEquals(date1: Date, date2: Date) {
  return date1.toLocaleDateString() === date2.toLocaleDateString();
}
function getCustomEvents() {
  const lsi = localStorage.getItem("bab_calendar_events");
  return lsi ? (JSON.parse(lsi) as CalendarEvent[]) : [];
}
function addEventToLS(event: CalendarEvent) {
  const events = getCustomEvents();
  events.push(event);
  localStorage.setItem("bab_calendar_events", JSON.stringify(events));
}
function removeEventFromLS(event: CalendarEvent) {
  let events = getCustomEvents();
  events = [
    ...events.filter((ev) => {
      return JSON.stringify(ev) !== JSON.stringify(event);
    }),
  ];
  localStorage.setItem("bab_calendar_events", JSON.stringify(events));
}
export default App;
