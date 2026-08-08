import {
  useEffect,
  useRef,
} from 'react';

import {
  CheckCircle2,
  Lock,
} from 'lucide-react';

import {
  buildMajorGridTimes,
  formatRange12h,
  formatTime12h,
  getEventGeometry,
  getGridHeightPx,
  minutesToHHMM,
  nowMinutesIST,
  parseHHMM,
} from '@/utils/scheduleTimeline';

import type {
  Appointment,
  BlockedEventGroup,
  WorkingHoursDay,
} from '@/types/owner';

/* ------------------------------------------------------------------
   CONSTANTS
------------------------------------------------------------------- */

const ROW_LABEL_WIDTH = 68;

const DEFAULT_OPEN_TIME =
  '09:30';

const DEFAULT_CLOSE_TIME =
  '20:00';

const TIMELINE_TOP_PADDING =
  34;

const TIMELINE_BOTTOM_PADDING =
  34;

/*
 * Header + date navigator area.
 *
 * Calendar itself will fill from under the navigator
 * to the bottom of the mobile viewport.
 */
const CALENDAR_TOP_OFFSET =
  154;

/* ------------------------------------------------------------------
   WORKING HOURS COMPATIBILITY
------------------------------------------------------------------- */

type WorkingHoursDayCompat =
  WorkingHoursDay & {
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;

    start?: string;
    end?: string;
    closed?: boolean;
  };

function resolveWorkingHours(
  workingHoursDay: WorkingHoursDay
) {
  const day =
    workingHoursDay as WorkingHoursDayCompat;

  return {
    openTime:
      day.openTime ??
      day.start ??
      DEFAULT_OPEN_TIME,

    closeTime:
      day.closeTime ??
      day.end ??
      DEFAULT_CLOSE_TIME,

    isClosed:
      day.isClosed ??
      day.closed ??
      false,
  };
}

/* ------------------------------------------------------------------
   TIME GRID
------------------------------------------------------------------- */

function TimeGridLines({
  gridStart,
  gridEnd,
}: {
  gridStart: string;
  gridEnd: string;
}) {
  const majorTimes =
    buildMajorGridTimes(
      gridStart,
      gridEnd,
      30
    );

  return (
    <>
      {majorTimes.map(
        (time) => {
          const { top } =
            getEventGeometry(
              gridStart,
              time,
              0
            );

          return (
            <div
              key={time}
              className="absolute left-0 right-0 flex items-start"
              style={{ top }}
            >
              <span
                className="shrink-0 -translate-y-1/2 pr-2 text-right text-[11px] text-[#6E7482]"
                style={{
                  width:
                    ROW_LABEL_WIDTH,
                }}
              >
                {formatTime12h(
                  time
                )}
              </span>

              <div className="h-px flex-1 bg-[#2B3240]" />
            </div>
          );
        }
      )}
    </>
  );
}

/* ------------------------------------------------------------------
   CURRENT TIME
------------------------------------------------------------------- */

function CurrentTimeLine({
  gridStart,
  gridEnd,
}: {
  gridStart: string;
  gridEnd: string;
}) {
  const now =
    nowMinutesIST();

  if (
    now <
      parseHHMM(gridStart) ||
    now >
      parseHHMM(gridEnd)
  ) {
    return null;
  }

  const { top } =
    getEventGeometry(
      gridStart,
      minutesToHHMM(now),
      0
    );

  return (
    <div
      className="pointer-events-none absolute right-0 z-20 flex items-center"
      style={{
        top,
        left:
          ROW_LABEL_WIDTH,
      }}
    >
      <div className="h-2 w-2 -translate-x-1/2 rounded-full bg-[#E5484D]" />

      <div className="h-px flex-1 bg-[#E5484D]" />
    </div>
  );
}

/* ------------------------------------------------------------------
   APPOINTMENT
------------------------------------------------------------------- */

function AppointmentBlock({
  appointment,
  gridStart,
  onClick,
}: {
  appointment: Appointment;
  gridStart: string;
  onClick: () => void;
}) {
  const durationMins =
    appointment.durationMins ??
    15;

  const { top, height } =
    getEventGeometry(
      gridStart,
      appointment.time,
      durationMins
    );

  const compact =
    height < 44;

  const completed =
    appointment.status ===
    'completed';

  const noShow =
    appointment.status ===
    'no_show';

  const endTime =
    appointment.endTime ??
    minutesToHHMM(
      parseHHMM(
        appointment.time
      ) + durationMins
    );

  const toneClasses =
    completed
      ? 'border-[#2B3240] bg-[#151922]/70 opacity-60'
      : noShow
        ? 'border-[#E5484D]/40 bg-[#E5484D]/10'
        : 'border-[#C8A06B]/60 bg-[#C8A06B]/10';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'absolute overflow-hidden rounded-lg border px-2.5 text-left',
        'transition-colors duration-150 active:brightness-110',
        toneClasses,
      ].join(' ')}
      style={{
        top,
        height,

        left:
          ROW_LABEL_WIDTH,

        right: 4,

        paddingTop:
          compact ? 3 : 6,
      }}
    >
      {compact ? (
        <div className="flex items-center gap-1 truncate text-[11px] font-medium text-[#F5F5F5]">
          {completed && (
            <CheckCircle2
              size={11}
              className="shrink-0 text-[#18B979]"
            />
          )}

          <span className="truncate">
            {
              appointment.serviceName
            }{' '}
            ·{' '}
            {
              appointment.customerName
            }
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            {completed && (
              <CheckCircle2
                size={13}
                className="shrink-0 text-[#18B979]"
              />
            )}

            <span className="truncate text-[13px] font-semibold text-[#F5F5F5]">
              {
                appointment.serviceName
              }
            </span>
          </div>

          <div className="truncate text-[12px] text-[#A7AAB4]">
            {
              appointment.customerName
            }
          </div>

          {height >= 62 && (
            <div className="truncate text-[11px] text-[#6E7482]">
              {formatRange12h(
                appointment.time,
                endTime
              )}
            </div>
          )}
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------
   OWNER BLOCK
------------------------------------------------------------------- */

function BlockedBlock({
  group,
  gridStart,
  onClick,
}: {
  group: BlockedEventGroup;
  gridStart: string;
  onClick: () => void;
}) {
  const durationMins =
    group.durationMins ??
    15;

  const { top, height } =
    getEventGeometry(
      gridStart,
      group.startTime,
      durationMins
    );

  const compact =
    height < 44;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'absolute overflow-hidden rounded-lg border border-dashed',
        'border-[#2B3240] bg-[#151922]/60 px-2.5 text-left',
        'transition-colors duration-150 active:bg-[#1C2230]',
      ].join(' ')}
      style={{
        top,
        height,

        left:
          ROW_LABEL_WIDTH,

        right: 4,

        paddingTop:
          compact ? 3 : 6,
      }}
    >
      <div className="flex items-center gap-1.5">
        <Lock
          size={
            compact ? 11 : 13
          }
          className="shrink-0 text-[#A7AAB4]"
        />

        <span className="truncate text-[12px] font-medium text-[#A7AAB4]">
          Owner Blocked
        </span>
      </div>

      {!compact && (
        <div className="truncate text-[11px] text-[#6E7482]">
          {formatRange12h(
            group.startTime,
            group.endTime
          )}
        </div>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------
   LUNCH BREAK
------------------------------------------------------------------- */

function LunchBlock({
  breakStart,
  breakEnd,
  gridStart,
  gridEnd,
}: {
  breakStart: string;
  breakEnd: string;
  gridStart: string;
  gridEnd: string;
}) {
  const breakStartMinutes =
    parseHHMM(
      breakStart
    );

  const breakEndMinutes =
    parseHHMM(
      breakEnd
    );

  const gridStartMinutes =
    parseHHMM(
      gridStart
    );

  const gridEndMinutes =
    parseHHMM(
      gridEnd
    );

  /*
   * Don't render a lunch period outside
   * actual salon working hours.
   */
  if (
    breakEndMinutes <=
      breakStartMinutes ||
    breakEndMinutes <=
      gridStartMinutes ||
    breakStartMinutes >=
      gridEndMinutes
  ) {
    return null;
  }

  const visibleStart =
    Math.max(
      breakStartMinutes,
      gridStartMinutes
    );

  const visibleEnd =
    Math.min(
      breakEndMinutes,
      gridEndMinutes
    );

  const durationMins =
    visibleEnd -
    visibleStart;

  const actualStart =
    minutesToHHMM(
      visibleStart
    );

  const actualEnd =
    minutesToHHMM(
      visibleEnd
    );

  const { top, height } =
    getEventGeometry(
      gridStart,
      actualStart,
      durationMins
    );

  return (
    <div
      className="absolute overflow-hidden rounded-lg border border-dashed border-[#2B3240] bg-[#11151D]/70 px-2.5"
      style={{
        top,
        height,

        left:
          ROW_LABEL_WIDTH,

        right: 4,
      }}
    >
      <div className="flex h-full items-center gap-1.5 text-[#6E7482]">
        <span className="text-[11px]">
          🍽 Lunch Break
        </span>

        {height >= 34 && (
          <span className="text-[10px]">
            {formatRange12h(
              actualStart,
              actualEnd
            )}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   MAIN CALENDAR
------------------------------------------------------------------- */

export function CalendarTimeline({
  workingHoursDay,
  breakStart,
  breakEnd,
  appointments,
  blockedGroups,
  isToday,
  onSelectAppointment,
  onSelectBlockedGroup,
}: {
  workingHoursDay:
    WorkingHoursDay;

  breakStart?: string;
  breakEnd?: string;

  appointments:
    Appointment[];

  blockedGroups:
    BlockedEventGroup[];

  isToday: boolean;

  onSelectAppointment: (
    appointment: Appointment
  ) => void;

  onSelectBlockedGroup: (
    group: BlockedEventGroup
  ) => void;
}) {
  const scrollRef =
    useRef<HTMLDivElement>(
      null
    );

  const hasAutoScrolled =
    useRef(false);

  const {
    openTime:
      gridStart,

    closeTime:
      gridEnd,

    isClosed,
  } =
    resolveWorkingHours(
      workingHoursDay
    );

  const gridHeight =
    getGridHeightPx(
      gridStart,
      gridEnd
    );

  /* ----------------------------------------------------------------
     RESET AUTO SCROLL
  ---------------------------------------------------------------- */

  useEffect(() => {
    hasAutoScrolled.current =
      false;
  }, [
    isToday,
    gridStart,
    gridEnd,
  ]);

  /* ----------------------------------------------------------------
     AUTO SCROLL TO CURRENT TIME
  ---------------------------------------------------------------- */

  useEffect(() => {
    if (
      !isToday ||
      hasAutoScrolled.current ||
      !scrollRef.current
    ) {
      return;
    }

    const now =
      nowMinutesIST();

    const openMinutes =
      parseHHMM(
        gridStart
      );

    const closeMinutes =
      parseHHMM(
        gridEnd
      );

    if (
      now < openMinutes ||
      now > closeMinutes
    ) {
      return;
    }

    const { top } =
      getEventGeometry(
        gridStart,
        minutesToHHMM(now),
        0
      );

    scrollRef.current.scrollTo({
      top: Math.max(
        top +
          TIMELINE_TOP_PADDING -
          90,
        0
      ),

      behavior: 'auto',
    });

    hasAutoScrolled.current =
      true;
  }, [
    isToday,
    gridStart,
    gridEnd,
  ]);

  /* ----------------------------------------------------------------
     CLOSED
  ---------------------------------------------------------------- */

  if (isClosed) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-[#2B3240] text-[14px] text-[#6E7482]"
        style={{
          height: `calc(100dvh - ${CALENDAR_TOP_OFFSET}px)`,
        }}
      >
        Salon is closed this day.
      </div>
    );
  }

  /* ----------------------------------------------------------------
     TIMELINE
  ---------------------------------------------------------------- */

  return (
    <div
      ref={scrollRef}
      className={[
        'relative w-full overflow-y-auto overscroll-contain',
        'rounded-2xl border border-[#2B3240] bg-[#0B0D12]',
      ].join(' ')}
      style={{
        height: `calc(100dvh - ${CALENDAR_TOP_OFFSET}px)`,

        WebkitOverflowScrolling:
          'touch',
      }}
    >
      {/*
       * Long content inside fixed viewport.
       */}
      <div
        className="relative w-full"
        style={{
          height:
            gridHeight +
            TIMELINE_TOP_PADDING +
            TIMELINE_BOTTOM_PADDING,
        }}
      >
        {/*
         * Actual timeline shifted down by 24px.
         */}
        <div
          className="absolute left-0 right-0"
          style={{
            top:
              TIMELINE_TOP_PADDING,

            height:
              gridHeight,
          }}
        >
          <TimeGridLines
            gridStart={
              gridStart
            }
            gridEnd={
              gridEnd
            }
          />

          {breakStart &&
            breakEnd && (
              <LunchBlock
                breakStart={
                  breakStart
                }
                breakEnd={
                  breakEnd
                }
                gridStart={
                  gridStart
                }
                gridEnd={
                  gridEnd
                }
              />
            )}

          {appointments.map(
            (appointment) => (
              <AppointmentBlock
                key={
                  appointment.appointmentId
                }
                appointment={
                  appointment
                }
                gridStart={
                  gridStart
                }
                onClick={() =>
                  onSelectAppointment(
                    appointment
                  )
                }
              />
            )
          )}

          {blockedGroups.map(
            (group) => (
              <BlockedBlock
                key={
                  group.lockIds.join(
                    '|'
                  )
                }
                group={group}
                gridStart={
                  gridStart
                }
                onClick={() =>
                  onSelectBlockedGroup(
                    group
                  )
                }
              />
            )
          )}

          {isToday && (
            <CurrentTimeLine
              gridStart={
                gridStart
              }
              gridEnd={
                gridEnd
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}