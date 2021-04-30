
  const proxy = useMemo(() => {
    let prevReached = null;
    return {
      pushStack(payload) {
        if (!prevReached) {
          prevReached = payload;
        } else {
          // 计算偏移位置
          let offsetLeft = 0;
          let offsetTop = 0;
          if (containerRef.current) {
            const Rect = containerRef.current.getBoundingClientRect();
            offsetLeft = Rect.left + 24;
            offsetTop = Rect.top - 24;
          }
          if (payload.type !== prevReached.type) {
            const validPayload =
              payload.type === 'markLine' ? payload : prevReached;
            dataIndexRef.current = validPayload.dataIndex;
            setTooltipStyle({
              left: validPayload.left + offsetLeft,
              top: validPayload.top + offsetTop,
              display: 'block',
            });
          } else {
            if (payload.type === 'markLine') {
              dataIndexRef.current = payload.dataIndex;
              setTooltipStyle({
                left: payload.left + offsetLeft,
                top: payload.top + offsetTop,
                display: 'block',
              });
            } else {
              setTooltipStyle({
                display: 'none',
              });
            }
          }

          prevReached = payload;
        }
      },
    };
  }, []);

  useEffect(() => {
    if (echartsRef.current) {
      const instance = echartsRef.current.getEchartsInstance();

      function handleMouseMove(data) {
        if (data.componentType !== 'markLine') {
          setTooltipStyle({
            display: 'none',
          });
        } else {
          const left = data.event.offsetX;
          const top = data.event.offsetY;

          proxy.pushStack({
            left,
            top,
            dataIndex: data.dataIndex,
            type: 'markLine',
          });
        }
      }

      function onChartClick(param) {
        const value = get(param, 'data.value', []);
        if (value.length >= 5 && value[4]) {
          window.open(`/sms/service/detail?id=${value[4]}`);
        }
      }

      const onScroll = () => {
        proxy.pushStack({
          type: 'globalout',
        });
      };
      window.addEventListener('scroll', onScroll);

      instance.on('mousemove', handleMouseMove);
      instance.on('click', onChartClick);
      return () => {
        instance.off('mousemove', handleMouseMove);
        instance.off('click', onChartClick);
        window.removeEventListener('scroll', onScroll);
      };
    }
  }, []);