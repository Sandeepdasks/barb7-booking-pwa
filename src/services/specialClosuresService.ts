import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import type {
  SpecialClosure,
} from '@/types/specialClosure.types';

/* ------------------------------------------------------------------
   FIRESTORE → CUSTOMER MODEL
------------------------------------------------------------------- */

/**
 * Firestore / owner-side closure fields currently use:
 *
 * {
 *   salonId
 *   date
 *   allDay
 *   startTime
 *   endTime
 *   label
 *   createdAt
 * }
 *
 * Customer-side SpecialClosure uses:
 *
 * {
 *   type: 'full_day' | 'partial_day'
 *   reason
 *   startTime
 *   endTime
 * }
 *
 * This function is the normalization boundary.
 */
function fromDoc(
  id: string,
  data: any
): SpecialClosure {
  return {
    id,

    salonId:
      data.salonId,

    date:
      data.date,

    type:
      data.allDay
        ? 'full_day'
        : 'partial_day',

    startTime:
      data.startTime ??
      null,

    endTime:
      data.endTime ??
      null,

    reason:
      data.label ??
      null,

    createdAt:
      data.createdAt,

    updatedAt:
      data.updatedAt ??
      data.createdAt,
  };
}

/* ------------------------------------------------------------------
   ONE CLOSURE FOR ONE DATE
------------------------------------------------------------------- */

/**
 * Customer booking page uses this listener.
 *
 * Returns:
 *
 * null
 *
 * when there is no one-off closure for the selected date.
 */
export function subscribeClosuresForDate(
  salonId: string,
  date: string,
  cb: (closures: SpecialClosure[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'holidays'),
    where('salonId', '==', salonId),
    where('type', '==', 'oneoff'),
    where('date', '==', date)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const closures = snapshot.docs
        .map((document) =>
          fromDoc(
            document.id,
            document.data()
          )
        )
        .sort((a, b) => {
          const aStart =
            a.startTime ?? '00:00';

          const bStart =
            b.startTime ?? '00:00';

          return aStart.localeCompare(
            bStart
          );
        });

      cb(closures);
    },
    (error) => {
      console.error(
        'CLOSURES FOR DATE LISTENER FAILED:',
        {
          salonId,
          date,
          code: error.code,
          message: error.message,
        }
      );

      cb([]);
    }
  );
}

/* ------------------------------------------------------------------
   UPCOMING CUSTOMER CLOSURES
------------------------------------------------------------------- */

/**
 * Optional customer-side listener for screens that need
 * all upcoming one-off closures.
 *
 * Kept here because some existing customer hooks may already
 * import subscribeSpecialClosures().
 */
export function subscribeSpecialClosures(
  salonId: string,
  fromDate: string,
  cb: (
    closures:
      SpecialClosure[]
  ) => void
): Unsubscribe {
  const q = query(
    collection(
      db,
      'holidays'
    ),

    where(
      'salonId',
      '==',
      salonId
    ),

    where(
      'type',
      '==',
      'oneoff'
    ),

    where(
      'date',
      '>=',
      fromDate
    )
  );

  return onSnapshot(
    q,

    (snapshot) => {
      const closures =
        snapshot.docs
          .map(
            (document) =>
              fromDoc(
                document.id,
                document.data()
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.date.localeCompare(
                b.date
              )
          );

      cb(
        closures
      );
    },

    (error) => {
      console.error(
        'SPECIAL CLOSURES LISTENER FAILED:',
        {
          salonId,
          fromDate,
          code:
            error.code,
          message:
            error.message,
        }
      );

      cb([]);
    }
  );
}